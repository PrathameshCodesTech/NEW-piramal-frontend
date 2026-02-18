import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../../services/api";

import DashboardHeader from "./components/DashboardHeader";
import KPISection from "./components/KPISection";
import KPIDetailModal from "./components/KPIDetailModal";
import ChartSection from "./components/ChartSection";
import TablesSection from "./components/TablesSection";
import AlertsSection from "./components/AlertsSection";
import QuickActionsPanel from "./components/QuickActionsPanel";
import PortfolioMap from "./components/PortfolioMap";
import PropertiesTable from "./components/PropertiesTable";
import PortfolioStats from "./components/PortfolioStats";
import FilterModal from "./components/FilterModal";
import ViewAllModal from "./components/ViewAllModal";

/* ── Helpers ── */
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

const toCsvParam = (arr) => {
  const a = Array.isArray(arr) ? arr : [];
  const clean = a.map((x) => String(x).trim()).filter(Boolean).filter((x, i, self) => self.indexOf(x) === i);
  return clean.length ? clean.join(",") : undefined;
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE — slim orchestrator
═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  // Applied + draft filters
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
  const [draft, setDraft] = useState(applied);
  const [filterOpen, setFilterOpen] = useState(false);

  // Chart types
  const [chart1Type, setChart1Type] = useState("bar");
  const [chart2Type, setChart2Type] = useState("pie");
  const [chart3Type, setChart3Type] = useState("bar");

  // Modals
  const [kpiModal, setKpiModal] = useState({ open: false, kpi: null });
  const [viewAllModal, setViewAllModal] = useState({ open: false, title: "", rows: [], cols: [] });

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

  /* ── Derived data ── */
  const kpis = useMemo(() => {
    if (!data?.kpis) return [];
    const k = data.kpis;
    return [
      { id: "occupancy", title: "Occupancy", value: k.occupancy_rate?.formatted || `${k.occupancy_rate?.value || 0}%`, type: "occupancy", change: k.occupancy_rate?.change || 0, changeLabel: k.occupancy_rate?.change_label || "vs last month", hoverInfo: "Click to see breakdown by property", detailData: k.occupancy_rate },
      { id: "vacant", title: "Vacant Area", value: k.vacant_area?.formatted || `${k.vacant_area?.value || 0} sqft`, type: "vacant", change: k.vacant_area?.change || 0, changeLabel: k.vacant_area?.change_label || "sqft", hoverInfo: "Click to see breakdown by property", detailData: k.vacant_area },
      { id: "collected", title: "Rent Collected", value: k.rent_collected?.formatted || `₹${fmtMoney(k.rent_collected?.value || 0)}`, type: "collected", change: k.rent_collected?.change || 0, changeLabel: k.rent_collected?.change_label || "vs target", hoverInfo: "Click for collection details", detailData: k.rent_collected },
      { id: "pending", title: "Pending Revenue", value: k.pending_revenue?.formatted || `₹${fmtMoney(k.pending_revenue?.value || 0)}`, type: "pending", subtitle: k.pending_revenue?.subtitle || "Receivables", hoverInfo: "Click for breakdown by property", detailData: k.pending_revenue },
      { id: "monthly_rent", title: "Monthly Rent Raised", value: k.monthly_rent_raised?.formatted || `₹${fmtMoney(k.monthly_rent_raised?.value || 0)}`, type: "expiries", subtitle: k.monthly_rent_raised?.subtitle || "This month", hoverInfo: "Click for breakdown by property", detailData: k.monthly_rent_raised },
      { id: "new_leases", title: "New Leases", value: k.new_leases_ytd?.formatted || String(k.new_leases_ytd?.value || 0), type: "default", subtitle: k.new_leases_ytd?.subtitle || "YTD", hoverInfo: "Click to see new leases", detailData: k.new_leases_ytd },
    ];
  }, [data]);

  const leasedVacantData = useMemo(() => {
    const chartData = data?.charts?.leased_vacant || [];
    if (selectedSiteIds.length === 0) return chartData;
    return chartData.filter((row) => selectedSiteIds.includes(row.propertyId));
  }, [data, selectedSiteIds]);

  const rentDueCollectedData = useMemo(() => data?.charts?.rent_due_collected || [], [data]);
  const expiryLadderData = useMemo(() => data?.charts?.expiry_ladder || [], [data]);

  const tblUpcoming = useMemo(() => {
    return (data?.tables?.upcoming_expiries || []).map((x, idx) => ({
      _raw: x, _idx: idx,
      Tenant: x?.tenant || "—",
      Rent: `₹${fmtMoney(x?.rent_due)}`,
      "Days Left": `${x?.days_left ?? "—"}d`,
    }));
  }, [data]);

  const tblOverdue = useMemo(() => {
    return (data?.tables?.top_overdue_tenants || []).map((x, idx) => ({
      _raw: x, _idx: idx,
      Tenant: x?.tenant || "—",
      Overdue: `₹${fmtMoney(x?.overdue)}`,
      Status: x?.bucket || "—",
    }));
  }, [data]);

  const tblVacantAging = useMemo(() => {
    return (data?.tables?.vacant_units_aging || []).map((x, idx) => ({
      _raw: x, _idx: idx,
      Unit: x?.unit_label || `Unit #${x?.unit_id ?? "—"}`,
      Area: `${fmtMoney(x?.area)} sqft`,
      "Vacant Since": x?.vacant_since ?? "—",
      Days: x?.days != null ? `${x.days}d` : "—",
    }));
  }, [data]);

  /* ── Handlers ── */
  const openFilters = () => { setDraft(applied); setFilterOpen(true); };
  const applyFilters = async () => { setFilterOpen(false); await loadDashboard(draft); };
  const refresh = () => loadDashboard(applied);

  const handleKpiClick = (kpi) => setKpiModal({ open: true, kpi });
  const handleKpiModalClose = () => setKpiModal({ open: false, kpi: null });

  const handleTableRowClick = (row, type) => {
    if (type === "lease" && row?._raw?.agreement_id) navigate(`/leases/agreements/${row._raw.agreement_id}`);
  };

  const handleViewAll = (title, rows, cols) => setViewAllModal({ open: true, title, rows, cols });


  const handleNavigateToSite = (siteId) => { if (siteId) navigate(`/properties/sites/${siteId}`); };

  /* ── API stubs for KPI drill-down (imported API objects) ── */
  const sitesAPI = useMemo(() => ({ get: async (id) => { try { const mod = await import("../../services/api"); return mod.sitesAPI?.get?.(id); } catch { return null; } } }), []);
  const agreementsAPI = useMemo(() => ({ list: async (params) => { try { const mod = await import("../../services/api"); return mod.agreementsAPI?.list?.(params); } catch { return []; } } }), []);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50/50">
      <DashboardHeader
        loading={loading}
        onRefresh={refresh}
        onOpenFilters={openFilters}
        filterOptions={filterOptions}
        selectedSiteIds={selectedSiteIds}
        onSelectedSiteIdsChange={setSelectedSiteIds}
        propertyDropdownOpen={propertyDropdownOpen}
        onPropertyDropdownToggle={() => setPropertyDropdownOpen((o) => !o)}
        onPropertyDropdownClose={() => setPropertyDropdownOpen(false)}
      />

      <div className="p-6 space-y-6 min-w-0 overflow-x-hidden">
        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700">{err}</div>
        )}

        {/* Row 1: KPIs */}
        <KPISection kpis={kpis} onKpiClick={handleKpiClick} />

        {/* Row 2: Charts */}
        <ChartSection
          leasedVacantData={leasedVacantData}
          rentDueCollectedData={rentDueCollectedData}
          expiryLadderData={expiryLadderData}
          chart1Type={chart1Type}
          chart2Type={chart2Type}
          chart3Type={chart3Type}
          onChart1TypeChange={setChart1Type}
          onChart2TypeChange={setChart2Type}
          onChart3TypeChange={setChart3Type}
        />

        {/* Row 3: Mini Tables */}
        <TablesSection
          tblUpcoming={tblUpcoming}
          tblOverdue={tblOverdue}
          tblVacantAging={tblVacantAging}
          onRowClick={handleTableRowClick}
          onViewAll={handleViewAll}
        />

        {/* Row 4: Alerts + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <AlertsSection
              alerts={data?.alerts || []}
              onNavigateToSite={handleNavigateToSite}
            />
          </div>
          <div className="lg:col-span-2">
            <QuickActionsPanel quickActions={data?.quick_actions || {}} />
          </div>
        </div>

        {/* Row 5: Portfolio Map */}
        <PortfolioMap portfolioMap={data?.portfolio_map || []} occupancyTimeline={data?.occupancy_timeline || []} />

        {/* Row 6: Properties Table (collapsible) */}
        <PropertiesTable properties={data?.properties || []} />

        {/* Row 7: Portfolio Stats */}
        <PortfolioStats stats={data?.portfolio_stats} />
      </div>

      {/* ── Modals ── */}
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        draft={draft}
        setDraft={setDraft}
        filterOptions={filterOptions}
        onApply={applyFilters}
        loading={loading}
      />

      <KPIDetailModal
        open={kpiModal.open}
        onClose={handleKpiModalClose}
        kpi={kpiModal.kpi}
        sitesAPI={sitesAPI}
        agreementsAPI={agreementsAPI}
      />

      <ViewAllModal
        open={viewAllModal.open}
        onClose={() => setViewAllModal({ open: false, title: "", rows: [], cols: [] })}
        title={viewAllModal.title}
        rows={viewAllModal.rows}
        cols={viewAllModal.cols}
      />

    </div>
  );
}
