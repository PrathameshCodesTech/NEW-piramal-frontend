import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, FileText, X, AlertCircle, List } from "lucide-react";
import { receivablesAPI, sitesAPI, tenantCompaniesAPI, ageingBucketsAPI } from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";

const BASE_PATH = "/rent-schedule-revenue/invoice";

function formatAmount(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(2)} K`;
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function ReceivablesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [ageingBuckets, setAgeingBuckets] = useState([]);
  const [filters, setFilters] = useState({
    property_ids: "",
    tenant_ids: "",
    from_date: "",
    to_date: "",
    ageing_bucket: "",
  });

  useEffect(() => {
    sitesAPI.list().then((r) => setSites(r?.results || r || [])).catch(() => setSites([]));
    tenantCompaniesAPI.list().then((r) => setTenants(r?.results || r || [])).catch(() => setTenants([]));
    ageingBucketsAPI.list().then((r) => setAgeingBuckets(r?.results || r || [])).catch(() => setAgeingBuckets([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.property_ids) params.property_ids = filters.property_ids;
    if (filters.tenant_ids) params.tenant_ids = filters.tenant_ids;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.ageing_bucket) params.ageing_bucket = filters.ageing_bucket;
    receivablesAPI
      .list(params)
      .then((r) => setData(r?.results || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const clearFilters = () =>
    setFilters({ property_ids: "", tenant_ids: "", from_date: "", to_date: "", ageing_bucket: "" });

  const propertyOptions = sites.map((s) => ({ value: String(s.id), label: s.name || s.site_name || `Site ${s.id}` }));
  const tenantOptions = tenants.map((t) => ({ value: String(t.id), label: t.legal_name || `Tenant ${t.id}` }));

  const ageingOptions = [
    { value: "", label: "All Ageing Buckets" },
    ...ageingBuckets.map((b) => ({ value: b.label || b.reporting_label, label: b.label || b.reporting_label || "—" })),
  ].filter((o) => o.value);

  const columns = [
    { key: "invoice_number", label: "Invoice No." },
    { key: "tenant_name", label: "Tenant", render: (r) => r.tenant_name || "—" },
    { key: "site_name", label: "Property", render: (r) => r.site_name || "—" },
    { key: "amount_due", label: "Amount Due", render: (r) => formatAmount(r.amount_due) },
    {
      key: "days_overdue",
      label: "Days Overdue",
      render: (r) => (
        <span className={r.days_overdue > 0 ? "text-red-600 font-medium" : ""}>
          {r.days_overdue > 0 ? r.days_overdue : "—"}
        </span>
      ),
    },
    {
      key: "ageing_bucket",
      label: "Ageing Bucket",
      render: (r) => (
        <Badge
          color={
            r.ageing_bucket === "Current" || r.days_overdue <= 0
              ? "emerald"
              : r.ageing_bucket?.includes("90")
                ? "red"
                : "amber"
          }
        >
          {r.ageing_bucket || "—"}
        </Badge>
      ),
    },
    { key: "due_date", label: "Due Date" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge color={r.is_disputed ? "red" : r.status === "OVERDUE" ? "red" : "amber"}>{r.status}</Badge>
      ),
    },
  ];

  const totalDue = data.reduce((sum, r) => sum + (parseFloat(r.amount_due) || 0), 0);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Receivables",
            value: formatAmount(totalDue),
            icon: Wallet,
            bg: "bg-emerald-50",
            text: "text-emerald-600",
          },
          {
            label: "Open Items",
            value: data.length,
            icon: List,
            bg: "bg-blue-50",
            text: "text-blue-600",
          },
          {
            label: "Overdue Count",
            value: data.filter((r) => r.days_overdue > 0).length,
            icon: AlertCircle,
            bg: "bg-red-50",
            text: "text-red-600",
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
          <Select
            value={filters.ageing_bucket}
            onChange={setFilter("ageing_bucket")}
            options={ageingOptions}
            className="w-40"
          />
          {(filters.property_ids ||
            filters.tenant_ids ||
            filters.from_date ||
            filters.to_date ||
            filters.ageing_bucket) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Receivables List</h4>
        </div>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No receivables"
            description="No open invoices with balance due match your filters."
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onRowClick={(r) => navigate(`${BASE_PATH}/${r.invoice_id}`)}
            emptyMessage="No receivables match your filters."
          />
        )}
      </div>
    </div>
  );
}
