import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Building2, TrendingUp, TrendingDown, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";

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
  const n = Number(pct);
  if (n >= 90) return "text-emerald-600";
  if (n >= 75) return "text-amber-600";
  return "text-red-600";
};

const occupancyBarColor = (pct) => {
  const n = Number(pct);
  if (n >= 90) return "bg-emerald-500";
  if (n >= 75) return "bg-amber-500";
  return "bg-red-500";
};

// Initials avatar
function Avatar({ name, size = "md" }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : "w-10 h-10 text-sm";
  return (
    <div className={cn("rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0", sz)}>
      {initials}
    </div>
  );
}

// Stat mini-card
function StatMini({ label, value, color = "gray" }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    gray: "bg-gray-50 text-gray-700",
  };
  return (
    <div className={cn("rounded-xl p-3", colors[color])}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="text-base font-bold">{value || "—"}</p>
    </div>
  );
}

export default function KPIDetailModal({ open, onClose, kpi, sitesAPI, agreementsAPI }) {
  const navigate = useNavigate();
  const [drillLevel, setDrillLevel] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [propertyDetail, setPropertyDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!open) {
      setDrillLevel(0);
      setSelectedProperty(null);
      setSelectedTenant(null);
      setPropertyDetail(null);
    }
  }, [open]);

  if (!open || !kpi) return null;
  const detailData = kpi?.detailData;

  /* ── Handlers ── */
  const handlePropertyClick = async (item) => {
    if (!item?.propertyId) return;
    setSelectedProperty(item);
    setDrillLevel(1);
    setLoadingDetail(true);
    try {
      const [siteRes, agRes] = await Promise.all([
        sitesAPI?.get?.(item.propertyId).catch(() => null),
        agreementsAPI?.list?.({ site_id: item.propertyId }).catch(() => null),
      ]);
      const agreements = Array.isArray(agRes) ? agRes : (agRes?.results || []);
      setPropertyDetail({ site: siteRes, agreements });
    } catch {
      setPropertyDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleTenantClick = (agreement) => {
    setSelectedTenant(agreement);
    setDrillLevel(2);
  };

  const goBack = () => {
    if (drillLevel === 2) { setDrillLevel(1); setSelectedTenant(null); }
    else if (drillLevel === 1) { setDrillLevel(0); setSelectedProperty(null); setPropertyDetail(null); }
  };

  /* ── Modal title ── */
  const modalTitle =
    drillLevel === 0 ? (kpi?.title || "Details")
    : drillLevel === 1 ? (selectedProperty?.label || "Property")
    : (selectedTenant?.tenant_name || selectedTenant?.tenant?.name || "Tenant");

  const modalSubtitle =
    drillLevel === 0 ? "Breakdown and insights"
    : drillLevel === 1 ? `Within ${selectedProperty?.label || "property"}`
    : "Lease details";

  /* ════════════════════════════════════
     LEVEL 0 — Overview
  ════════════════════════════════════ */
  const renderLevel0 = () => {
    const comp = detailData?.comparison;
    const breakdown = detailData?.breakdown || [];
    const insights = detailData?.insights || [];

    return (
      <div className="space-y-5">
        {/* Period Comparison — two cards like mockup */}
        {comp && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
              <p className="text-xs text-emerald-100 font-medium mb-1">Current Period</p>
              <p className="text-3xl font-bold">{comp.current}</p>
              <p className="text-xs text-emerald-200 mt-1">{comp.currentLabel || "Portfolio (current period)"}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">Previous Period</p>
              <p className="text-3xl font-bold text-gray-700">{comp.previous}</p>
              <p className="text-xs text-gray-400 mt-1">{comp.previousLabel || "Portfolio (previous period)"}</p>
            </div>
          </div>
        )}

        {/* Breakdown by Property */}
        {breakdown.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {detailData?.breakdownTitle || "Breakdown by Property"}
            </h4>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {breakdown.map((item, i) => {
                const pct = typeof item.rawValue === "number" ? item.rawValue : parseFloat(item.value);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePropertyClick(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 bg-gray-50 transition-colors group"
                  >
                    {/* Green dot */}
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"
                    )} />

                    <span className="flex-1 text-sm font-medium text-gray-800 text-left">{item.label}</span>

                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold", pct >= 90 ? "text-emerald-700" : pct >= 75 ? "text-amber-700" : "text-red-700")}>
                        {item.value}
                      </span>
                      {item.change !== undefined && (
                        <span className={cn(
                          "inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
                          item.change >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          {item.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {item.change >= 0 ? "+" : ""}{item.change}%
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Insights */}
        {insights.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Insights</h4>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="block w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                  <span className="text-sm text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!comp && !breakdown.length && !insights.length && (
          <p className="text-sm text-gray-500 text-center py-8">No detail data available.</p>
        )}
      </div>
    );
  };

  /* ════════════════════════════════════
     LEVEL 1 — Property Detail
  ════════════════════════════════════ */
  const renderLevel1 = () => {
    if (loadingDetail) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
          <p className="text-sm text-gray-500">Loading property details…</p>
        </div>
      );
    }

    const site = propertyDetail?.site;
    const agreements = propertyDetail?.agreements || [];

    const totalLeasable = site?.total_area_sqft ?? selectedProperty?.totalLeasable ?? null;
    const leased = site?.leased_area_sqft ?? null;
    const vacant = site?.vacant_area_sqft ?? (totalLeasable && leased ? totalLeasable - leased : null);
    const occupancy = site?.occupancy ?? (typeof selectedProperty?.rawValue === "number" ? selectedProperty.rawValue : null);

    return (
      <div className="space-y-5">
        {/* Back */}
        <button type="button" onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to breakdown
        </button>

        {/* Site name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">{selectedProperty?.label}</h4>
            <p className="text-xs text-gray-500">{site?.address || "Property"}</p>
          </div>
        </div>

        {/* Key Details 2×2 grid */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Details</p>
          <div className="grid grid-cols-2 gap-2.5">
            <StatMini
              label="Total Leasable"
              value={totalLeasable ? `${Number(totalLeasable).toLocaleString("en-IN")} sqft` : null}
              color="gray"
            />
            <StatMini
              label="Leased"
              value={leased != null ? `${Number(leased).toLocaleString("en-IN")} sqft` : null}
              color="emerald"
            />
            <StatMini
              label="Vacant"
              value={vacant != null ? `${Number(vacant).toLocaleString("en-IN")} sqft` : null}
              color="amber"
            />
            <StatMini
              label="Occupancy"
              value={occupancy != null ? `${occupancy}%` : (selectedProperty?.value || null)}
              color={occupancy >= 90 ? "emerald" : occupancy >= 75 ? "amber" : "red"}
            />
          </div>
        </div>

        {/* Occupancy bar */}
        {occupancy != null && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Occupancy</span>
              <span className={cn("text-xs font-bold", occupancyColor(occupancy))}>{occupancy}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-700", occupancyBarColor(occupancy))}
                style={{ width: `${Math.min(100, occupancy)}%` }} />
            </div>
          </div>
        )}

        {/* Tenants */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Tenants · Leased / Vacant Area
          </p>
          {agreements.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-xl">
              No active agreements found for this property
            </div>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {agreements.map((agr, i) => {
                const tenantName = agr.tenant_name || agr.tenant?.legal_name || agr.tenant?.name || "Tenant";
                const leasedSqft = agr.allocated_area || agr.total_allocated_area;
                const vacantSqft = agr.vacant_area;
                return (
                  <button
                    key={agr.id || i}
                    type="button"
                    onClick={() => handleTenantClick(agr)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 bg-white border border-gray-100 transition-colors group"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="flex-1 text-sm font-medium text-gray-800 text-left">{tenantName}</span>
                    <div className="text-right">
                      {leasedSqft && (
                        <span className="text-sm text-emerald-700 font-semibold">
                          {Number(leasedSqft).toLocaleString("en-IN")} sqft leased
                        </span>
                      )}
                      {vacantSqft > 0 && (
                        <span className="text-xs text-amber-600 ml-1.5">
                          · {Number(vacantSqft).toLocaleString("en-IN")} sqft vacant
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════
     LEVEL 2 — Tenant / Lease Detail
  ════════════════════════════════════ */
  const renderLevel2 = () => {
    if (!selectedTenant) return null;
    const agr = selectedTenant;
    const tenantName = agr.tenant_name || agr.tenant?.legal_name || agr.tenant?.name || "Tenant";
    const statusVariant = agr.status === "ACTIVE" ? "success" : agr.status === "DRAFT" ? "warning" : agr.status === "EXPIRED" ? "danger" : "default";

    return (
      <div className="space-y-5">
        {/* Back */}
        <button type="button" onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to {selectedProperty?.label || "property"}
        </button>

        {/* Tenant header */}
        <div className="flex items-center gap-3">
          <Avatar name={tenantName} />
          <div>
            <h4 className="text-base font-bold text-gray-900">{tenantName}</h4>
            <p className="text-xs text-gray-500">Lease Details</p>
          </div>
          <div className="ml-auto">
            <Badge variant={statusVariant}>{agr.status || "—"}</Badge>
          </div>
        </div>

        {/* Detail grid */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              { label: "Lease ID", value: agr.agreement_number || agr.lease_id || agr.id },
              { label: "Monthly Rent", value: agr.base_rent_monthly ? fmtMoney(agr.base_rent_monthly) : agr.monthly_rent ? fmtMoney(agr.monthly_rent) : null },
              { label: "Area", value: agr.allocated_area ? `${Number(agr.allocated_area).toLocaleString("en-IN")} sqft` : agr.total_allocated_area ? `${Number(agr.total_allocated_area).toLocaleString("en-IN")} sqft` : null },
              { label: "Rate / sqft", value: agr.rate_per_sqft_monthly ? `₹${Number(agr.rate_per_sqft_monthly).toLocaleString("en-IN")}/sqft` : null },
              { label: "Commencement", value: agr.commencement_date || agr.start_date },
              { label: "Expiry", value: agr.expiry_date || agr.end_date },
              { label: "Billing Freq", value: agr.billing_frequency },
              { label: "Agreement Type", value: agr.agreement_type },
            ].map(({ label, value }) => value != null && (
              <div key={label}>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* View lease button */}
        {(agr.id || agr.agreement_id) && (
          <button
            type="button"
            onClick={() => { onClose(); navigate(`/leases/agreements/${agr.id || agr.agreement_id}`); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-300 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Full Lease
          </button>
        )}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      maxWidth="xl"
      bodyMaxHeight="72vh"
      greenHeader
    >
      {drillLevel === 0 && renderLevel0()}
      {drillLevel === 1 && renderLevel1()}
      {drillLevel === 2 && renderLevel2()}
    </Modal>
  );
}
