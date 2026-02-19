import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Download, FileText, BarChart2, PieChart, Wallet } from "lucide-react";
import { revenueRecognitionAPI, sitesAPI, tenantCompaniesAPI } from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import SimplePie from "../dashboard/ui/SimplePie";

const BASE_PATH = "/billing/invoices";

function formatAmount(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(2)} K`;
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function TrendBarChart({ data, height = 200 }) {
  if (!data?.length)
    return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>;

  const W = 400;
  const H = height;
  const PAD = { top: 20, right: 16, bottom: 48, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(
    1,
    ...data.flatMap((d) => [Number(d.billed) || 0, Number(d.collected) || 0])
  );
  const groupW = chartW / data.length;
  const barPad = groupW * 0.15;
  const barW = (groupW - barPad * 2) / 2 - 2;
  const toY = (v) => chartH - (v / maxVal) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = PAD.top + chartH * (1 - pct);
        return (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke={i === 0 ? "#d1d5db" : "#f3f4f6"}
              strokeWidth={i === 0 ? 1 : 0.5}
            />
            <text x={PAD.left - 5} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
              {formatAmount(maxVal * pct)}
            </text>
          </g>
        );
      })}
      {data.map((d, gi) => {
        const groupX = PAD.left + gi * groupW + barPad;
        const billed = Number(d.billed) || 0;
        const collected = Number(d.collected) || 0;
        const bH1 = Math.max(2, (billed / maxVal) * chartH);
        const bH2 = Math.max(2, (collected / maxVal) * chartH);
        const bY1 = PAD.top + chartH - bH1;
        const bY2 = PAD.top + chartH - bH2;
        const label = String(d.month || "").length > 10 ? String(d.month).slice(0, 9) + "…" : d.month;
        return (
          <g key={gi}>
            <rect
              x={groupX}
              y={bY1}
              width={barW}
              height={bH1}
              rx={3}
              fill="#6366f1"
              opacity={0.9}
            />
            <rect
              x={groupX + barW + 2}
              y={bY2}
              width={barW}
              height={bH2}
              rx={3}
              fill="#10b981"
              opacity={0.9}
            />
            <text
              x={groupX + barW + 1}
              y={H - PAD.bottom + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#6b7280"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function RevenueRecognitionPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ details: [], trend: [], by_charge_type: [] });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sites, setSites] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [filters, setFilters] = useState({
    property_ids: "",
    tenant_ids: "",
    from_date: "",
    to_date: "",
    search: "",
  });

  useEffect(() => {
    sitesAPI.list().then((r) => setSites(r?.results || r || [])).catch(() => setSites([]));
    tenantCompaniesAPI.list().then((r) => setTenants(r?.results || r || [])).catch(() => setTenants([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.property_ids) params.site_ids = filters.property_ids;
    if (filters.tenant_ids) params.tenant_ids = filters.tenant_ids;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.search) params.search = filters.search;
    revenueRecognitionAPI
      .list(params)
      .then((r) =>
        setData({
          details: r?.details || [],
          trend: r?.trend || [],
          by_charge_type: r?.by_charge_type || [],
        })
      )
      .catch(() => setData({ details: [], trend: [], by_charge_type: [] }))
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const clearFilters = () =>
    setFilters({ property_ids: "", tenant_ids: "", from_date: "", to_date: "", search: "" });

  const handleExport = () => {
    setExporting(true);
    const params = {};
    if (filters.property_ids) params.site_ids = filters.property_ids;
    if (filters.tenant_ids) params.tenant_ids = filters.tenant_ids;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.search) params.search = filters.search;
    revenueRecognitionAPI
      .export(params)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "revenue-recognition.csv";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {})
      .finally(() => setExporting(false));
  };

  const propertyOptions = sites.map((s) => ({
    value: String(s.id),
    label: s.name || s.site_name || `Site ${s.id}`,
  }));
  const tenantOptions = tenants.map((t) => ({
    value: String(t.id),
    label: t.legal_name || `Tenant ${t.id}`,
  }));

  const details = data.details || [];
  const trend = data.trend || [];
  const byChargeType = data.by_charge_type || [];

  const totalBilled = details.reduce((s, r) => s + (parseFloat(r.billed) || 0), 0);
  const totalCollected = details.reduce((s, r) => s + (parseFloat(r.collected) || 0), 0);

  const pieSegments = byChargeType.map((row, i) => ({
    value: parseFloat(row.billed) || 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
    label: row.charge_type || "OTHER",
  }));

  const columns = [
    { key: "invoice_number", label: "Invoice No.", render: (r) => r.invoice_number || "—" },
    { key: "billing_period", label: "Billing Period", render: (r) => r.billing_period || "—" },
    { key: "tenant_name", label: "Tenant", render: (r) => r.tenant_name || "—" },
    { key: "billed", label: "Billed", render: (r) => formatAmount(r.billed) },
    { key: "collected", label: "Collected", render: (r) => formatAmount(r.collected) },
    {
      key: "recognition_status",
      label: "Recognition Status",
      render: (r) => (
        <Badge color={r.recognition_status === "ACCRUED" ? "emerald" : "gray"}>
          {r.recognition_status || "—"}
        </Badge>
      ),
    },
    {
      key: "escalation_notes",
      label: "Escalation Notes",
      render: (r) => (r.escalation_notes ? String(r.escalation_notes).slice(0, 40) + (r.escalation_notes?.length > 40 ? "…" : "") : "—"),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Billed",
            value: formatAmount(totalBilled),
            icon: TrendingUp,
            bg: "bg-emerald-50",
            text: "text-emerald-600",
          },
          {
            label: "Total Collected",
            value: formatAmount(totalCollected),
            icon: Wallet,
            bg: "bg-blue-50",
            text: "text-blue-600",
          },
          {
            label: "Invoices",
            value: details.length,
            icon: FileText,
            bg: "bg-amber-50",
            text: "text-amber-600",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${item.text}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-800 truncate">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filters.property_ids}
            onChange={setFilter("property_ids")}
            options={[{ value: "", label: "All Properties" }, ...propertyOptions]}
            className="w-40"
          />
          <Select
            value={filters.tenant_ids}
            onChange={setFilter("tenant_ids")}
            options={[{ value: "", label: "All Tenants" }, ...tenantOptions]}
            className="w-40"
          />
          <Input type="date" value={filters.from_date} onChange={setFilter("from_date")} className="w-36" />
          <Input type="date" value={filters.to_date} onChange={setFilter("to_date")} className="w-36" />
          <Input
            type="text"
            placeholder="Search invoice/tenant"
            value={filters.search}
            onChange={setFilter("search")}
            className="w-44"
          />
          {(filters.property_ids || filters.tenant_ids || filters.from_date || filters.to_date || filters.search) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              Clear
            </button>
          )}
        </div>
        <Button onClick={handleExport} disabled={exporting} variant="secondary" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5 border-l-2 border-emerald-500">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Revenue Trend (Billed vs Collected)</h4>
          </div>
          <div className="flex gap-4 mb-2">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Billed
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Collected
            </span>
          </div>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
          ) : (
            <TrendBarChart data={trend} height={220} />
          )}
        </Card>

        <Card className="p-5 border-l-2 border-emerald-500">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Revenue by Charge Type</h4>
          </div>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
          ) : pieSegments.some((s) => s.value > 0) ? (
            <div className="flex flex-col items-center">
              <SimplePie
                size={180}
                segments={pieSegments}
                innerContent={
                  <div style={{ textAlign: "center", lineHeight: 1.2 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {formatAmount(pieSegments.reduce((s, seg) => s + seg.value, 0))}
                    </div>
                    <div style={{ fontSize: 9, color: "#6b7280" }}>Total Billed</div>
                  </div>
                }
              />
              <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                {pieSegments.map((s, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </Card>
      </div>

      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Revenue Recognition Details</h4>
        </div>
        {!loading && details.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No revenue recognition data"
            description="No invoices match your filters. Adjust filters or create invoices to see data."
          />
        ) : (
          <DataTable
            columns={columns}
            data={details}
            loading={loading}
            onRowClick={(r) => r.invoice_id && navigate(`${BASE_PATH}/${r.invoice_id}`)}
            emptyMessage="No revenue recognition details match your filters."
          />
        )}
      </div>
    </div>
  );
}
