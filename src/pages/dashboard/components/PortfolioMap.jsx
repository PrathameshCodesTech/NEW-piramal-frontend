import { useState } from "react";
import { Layers, MapPin, X, ArrowLeft, Building2, Users, TrendingUp, ChevronRight, IndianRupee } from "lucide-react";
import Card from "../ui/Card";

const cn = (...a) => a.filter(Boolean).join(" ");

const fmtMoney = (v) => {
  const n = Number(v);
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")}Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const occupancyColor = (pct) => {
  if (pct >= 90) return { pin: "bg-emerald-500", ring: "ring-emerald-200", heatmap: "rgba(16,185,129,0.35)", text: "text-emerald-700", bar: "bg-emerald-500" };
  if (pct >= 75) return { pin: "bg-amber-500", ring: "ring-amber-200", heatmap: "rgba(245,158,11,0.35)", text: "text-amber-700", bar: "bg-amber-500" };
  return { pin: "bg-red-500", ring: "ring-red-200", heatmap: "rgba(239,68,68,0.35)", text: "text-red-700", bar: "bg-red-500" };
};

/* ── Stat mini-widget ── */
function Stat({ icon: Icon, label, value, color = "emerald" }) {
  const colors = { emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", blue: "bg-blue-50 text-blue-700", gray: "bg-gray-100 text-gray-600" };
  return (
    <div className={cn("rounded-xl p-3 flex items-center gap-2.5", colors[color])}>
      <Icon className="w-4 h-4 shrink-0 opacity-70" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{label}</p>
        <p className="text-sm font-bold truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ── Pin positions (distribute evenly if no lat/lng) ── */
function pinPosition(pin, i, total) {
  if (pin.latitude && pin.longitude) {
    // Rough India bounding box: lat 8–37, lng 68–98
    const x = Math.max(5, Math.min(90, ((pin.longitude - 68) / 30) * 90));
    const y = Math.max(15, Math.min(75, (1 - (pin.latitude - 8) / 29) * 70));
    return { left: `${x}%`, top: `${y}%` };
  }
  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  const col = i % cols;
  const row = Math.floor(i / cols);
  return {
    left: `${15 + (col / Math.max(cols - 1, 1)) * 70}%`,
    top: `${20 + (row / Math.max(Math.ceil(total / cols) - 1, 1)) * 50}%`,
  };
}

export default function PortfolioMap({ portfolioMap = [], occupancyTimeline = [] }) {
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [drillLevel, setDrillLevel] = useState(0); // 0=map, 1=property, 2=tenant
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [pinTooltip, setPinTooltip] = useState(null);

  const handlePinClick = (pin) => {
    setSelectedPin(pin);
    setDrillLevel(1);
    setSelectedTenant(null);
  };

  const handleTenantClick = (t) => {
    setSelectedTenant(t);
    setDrillLevel(2);
  };

  const goBack = () => {
    if (drillLevel === 2) { setDrillLevel(1); setSelectedTenant(null); }
    else { setDrillLevel(0); setSelectedPin(null); }
  };

  const closePanel = () => { setDrillLevel(0); setSelectedPin(null); setSelectedTenant(null); };

  /* ── Timeline chart ── */
  const tlData = occupancyTimeline;
  const maxOcc = Math.max(1, ...tlData.map((d) => Math.max(Number(d.occupied) || 0, Number(d.vacant) || 0)));
  const TLW = 400; const TLH = 160;
  const TLP = { top: 12, right: 8, bottom: 28, left: 8 };
  const tlChartW = TLW - TLP.left - TLP.right;
  const tlChartH = TLH - TLP.top - TLP.bottom;
  const tlStep = tlData.length > 1 ? tlChartW / (tlData.length - 1) : tlChartW;
  const tlY = (v) => TLP.top + tlChartH - (v / maxOcc) * tlChartH;
  const tlX = (i) => TLP.left + i * tlStep;

  const occupiedCoords = tlData.map((d, i) => [tlX(i), tlY(Number(d.occupied) || 0)]);
  const vacantCoords = tlData.map((d, i) => [tlX(i), tlY(Number(d.vacant) || 0)]);

  const makeArea = (coords) =>
    `M ${TLP.left},${TLP.top + tlChartH} L ${coords.map(([x, y]) => `${x},${y}`).join(" L ")} L ${TLP.left + tlChartW},${TLP.top + tlChartH} Z`;
  const makeLine = (coords) => `M ${coords.map(([x, y]) => `${x},${y}`).join(" L ")}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* ── Portfolio Map ── */}
      <Card className="lg:col-span-3 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Portfolio Map</h3>
            <p className="text-xs text-gray-500">{portfolioMap.length} propert{portfolioMap.length !== 1 ? "ies" : "y"}</p>
          </div>
          <button
            onClick={() => setHeatmapMode((p) => !p)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              heatmapMode
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Heatmap
          </button>
        </div>

        {/* Map canvas */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200" style={{ height: 240 }}>
          {/* Terrain SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
            {/* Sky gradient */}
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#f0fdf4" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#skyGrad)" />
            {/* Mountains/terrain */}
            <path d="M0,150 Q60,90 100,110 Q140,130 180,90 Q220,50 260,80 Q300,110 340,70 Q370,50 400,80 L400,240 L0,240 Z" fill="#d1d5db" opacity="0.5" />
            <path d="M0,170 Q80,130 130,150 Q180,170 240,140 Q300,110 360,145 Q380,155 400,140 L400,240 L0,240 Z" fill="#e5e7eb" opacity="0.6" />
            <path d="M0,200 Q100,180 200,195 T400,185 L400,240 L0,240 Z" fill="#f3f4f6" />

            {/* Heatmap overlay blobs */}
            {heatmapMode && portfolioMap.map((pin, i) => {
              const col = occupancyColor(pin.occupancy);
              const pos = pinPosition(pin, i, portfolioMap.length);
              const cx = parseFloat(pos.left) * 4;
              const cy = parseFloat(pos.top) * 2.4;
              return (
                <ellipse key={pin.id || i} cx={cx} cy={cy} rx={40} ry={28}
                  fill={col.heatmap}
                  style={{ filter: "blur(18px)" }}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {pinTooltip && (
            <div
              className="absolute z-30 pointer-events-none bg-gray-900/90 text-white rounded-lg px-3 py-2 text-xs shadow-xl"
              style={{ left: pinTooltip.left, top: pinTooltip.top, transform: "translate(-50%, -130%)" }}
            >
              <p className="font-semibold">{pinTooltip.name}</p>
              <p className="text-gray-300">{pinTooltip.occupancy}% occupancy</p>
              {pinTooltip.monthly_yield && <p className="text-emerald-300">{pinTooltip.monthly_yield}/mo</p>}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900/90" />
            </div>
          )}

          {/* Pins */}
          {portfolioMap.map((pin, i) => {
            const col = occupancyColor(pin.occupancy);
            const pos = pinPosition(pin, i, portfolioMap.length);
            const isSelected = selectedPin?.id === pin.id;
            return (
              <button
                key={pin.id || i}
                type="button"
                className="absolute z-20 focus:outline-none"
                style={{ ...pos, transform: "translate(-50%, -50%)" }}
                onClick={() => handlePinClick(pin)}
                onMouseEnter={() => setPinTooltip({ ...pin, ...pos })}
                onMouseLeave={() => setPinTooltip(null)}
              >
                {/* Pulse ring */}
                {isSelected && (
                  <span className={cn("absolute inset-0 rounded-full animate-ping opacity-50", col.pin)} />
                )}
                <div className={cn(
                  "relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
                  col.pin,
                  "ring-4", isSelected ? "ring-white scale-125" : col.ring + " hover:scale-110"
                )}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                {/* Name tag */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                  <span className="text-[10px] font-semibold text-gray-700 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                    {pin.name}
                  </span>
                </div>
              </button>
            );
          })}

          {portfolioMap.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
              No properties to display
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-600">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" />≥90% Occupied</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" />75–89%</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" />{"<"}75%</div>
        </div>
      </Card>

      {/* ── Detail Panel / Occupancy Timeline ── */}
      <Card className="lg:col-span-2 p-4 flex flex-col">
        {drillLevel === 0 ? (
          /* Occupancy Timeline */
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Occupancy & Lease Timeline</h3>
                <p className="text-xs text-gray-500">Last 6 months</p>
              </div>
            </div>

            {tlData.length > 0 ? (
              <div className="flex-1">
                <svg viewBox={`0 0 ${TLW} ${TLH}`} className="w-full" style={{ height: 160 }}>
                  <defs>
                    <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
                    </linearGradient>
                    <linearGradient id="vacGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path d={makeArea(occupiedCoords)} fill="url(#occGrad)" />
                  <path d={makeArea(vacantCoords)} fill="url(#vacGrad)" />
                  <path d={makeLine(occupiedCoords)} fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" />
                  <path d={makeLine(vacantCoords)} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" strokeDasharray="4,3" />
                  {/* Month labels */}
                  {tlData.map((d, i) => (
                    <text key={i} x={tlX(i)} y={TLH - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
                      {d.month}
                    </text>
                  ))}
                </svg>

                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-emerald-500" />Occupied</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-red-400" />Vacant</div>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2"/></svg>
                    Expiring
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                No timeline data
              </div>
            )}

            {/* Property quick-list */}
            {portfolioMap.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Properties</p>
                {portfolioMap.map((pin, i) => {
                  const col = occupancyColor(pin.occupancy);
                  return (
                    <button key={pin.id || i} type="button" onClick={() => handlePinClick(pin)}
                      className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
                      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", col.pin)} />
                      <span className="text-sm font-medium text-gray-700 flex-1 text-left truncate">{pin.name}</span>
                      <span className={cn("text-sm font-bold", col.text)}>{pin.occupancy}%</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : drillLevel === 1 ? (
          /* Level 1: Property Detail */
          <>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={goBack}
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to map
              </button>
              <button type="button" onClick={closePanel} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Property header */}
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const col = occupancyColor(selectedPin.occupancy);
                return (
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", col.pin)}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                );
              })()}
              <div className="min-w-0">
                <h4 className="text-base font-bold text-gray-900 truncate">{selectedPin.name}</h4>
                <p className="text-xs text-gray-500 truncate">{selectedPin.address || "Property"}</p>
              </div>
            </div>

            {/* Occupancy bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Occupancy</span>
                <span className={cn("font-bold", occupancyColor(selectedPin.occupancy).text)}>
                  {selectedPin.occupancy}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", occupancyColor(selectedPin.occupancy).bar)}
                  style={{ width: `${Math.min(100, selectedPin.occupancy)}%` }} />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Stat icon={TrendingUp} label="Occupancy" value={`${selectedPin.occupancy}%`} color="emerald" />
              <Stat icon={IndianRupee} label="Monthly Yield" value={selectedPin.monthly_yield} color="blue" />
              <Stat icon={Building2} label="Vacant Days" value={selectedPin.vacant_days > 0 ? `${selectedPin.vacant_days}d` : "—"} color="amber" />
              <Stat icon={Users} label="Status" value={selectedPin.occupancy >= 90 ? "Excellent" : selectedPin.occupancy >= 75 ? "Good" : "Needs Attention"} color="gray" />
            </div>

            {/* Tenants sub-list */}
            {selectedPin.tenants?.length > 0 && (
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Tenants</p>
                <div className="space-y-1.5 overflow-y-auto max-h-32">
                  {selectedPin.tenants.map((t, i) => (
                    <button key={i} type="button" onClick={() => handleTenantClick(t)}
                      className="w-full flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors group text-left">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-sm font-medium text-gray-700 flex-1 truncate">{t.name || t.tenant}</span>
                      <span className="text-xs text-emerald-600 font-semibold shrink-0">{t.area ? `${Number(t.area).toLocaleString("en-IN")} sqft` : ""}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Level 2: Tenant Detail */
          <>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={goBack}
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to {selectedPin?.name}
              </button>
              <button type="button" onClick={closePanel} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Tenant avatar + name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-blue-700">
                  {(selectedTenant?.name || selectedTenant?.tenant || "?").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">{selectedTenant?.name || selectedTenant?.tenant}</h4>
                <p className="text-xs text-gray-500">At {selectedPin?.name}</p>
              </div>
            </div>

            {/* Lease details */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {[
                { label: "Leased Area", value: selectedTenant?.area ? `${Number(selectedTenant.area).toLocaleString("en-IN")} sqft` : null },
                { label: "Monthly Rent", value: selectedTenant?.rent ? fmtMoney(selectedTenant.rent) : null },
                { label: "Lease ID", value: selectedTenant?.lease_id || selectedTenant?.agreement_id },
                { label: "Expiry", value: selectedTenant?.expiry_date },
                { label: "Status", value: selectedTenant?.status },
              ].filter((f) => f.value).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
