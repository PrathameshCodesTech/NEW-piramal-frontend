import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Mail, Download, X, MoreVertical, Receipt } from "lucide-react";
import { invoicesAPI, sitesAPI, tenantCompaniesAPI } from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PENDING", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "DISPUTED", label: "Disputed" },
];

const BASE_PATH = "/rent-schedule-revenue/invoice";

function formatAmount(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(2)} K`;
  return `₹${n.toFixed(2)}`;
}

export default function InvoicePage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    property_ids: "",
    tenant_ids: "",
    from_date: "",
    to_date: "",
    status: "",
  });

  useEffect(() => {
    sitesAPI.list().then((r) => setSites(r?.results || r || [])).catch(() => setSites([]));
    tenantCompaniesAPI.list().then((r) => setTenants(r?.results || r || [])).catch(() => setTenants([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.property_ids) params.property_ids = filters.property_ids;
    if (filters.tenant_ids) params.tenant_ids = filters.tenant_ids;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.status) params.status = filters.status;
    invoicesAPI
      .list(params)
      .then((r) => setData(r?.results || r || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map((r) => r.id)));
  };

  const handleBulkEmail = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one invoice");
      return;
    }
    try {
      await invoicesAPI.bulkEmail([...selectedIds]);
      toast.success("Bulk email sent");
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message || "Bulk email failed");
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (filters.property_ids) params.property_ids = filters.property_ids;
      if (filters.tenant_ids) params.tenant_ids = filters.tenant_ids;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.status) params.status = filters.status;
      const blob = await invoicesAPI.export(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoices.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    } catch (err) {
      toast.error(err.message || "Export failed");
    }
  };

  const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const clearFilters = () => setFilters({ property_ids: "", tenant_ids: "", from_date: "", to_date: "", status: "" });

  const propertyOptions = sites.map((s) => ({ value: String(s.id), label: s.name || s.site_name || `Site ${s.id}` }));
  const tenantOptions = tenants.map((t) => ({ value: String(t.id), label: t.legal_name || `Tenant ${t.id}` }));

  const columns = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={data.length > 0 && selectedIds.size === data.length}
          onChange={toggleSelectAll}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
      ),
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedIds.has(r.id)}
          onChange={() => toggleSelect(r.id)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
      ),
      className: "w-10",
    },
    { key: "invoice_number", label: "Invoice No." },
    { key: "invoice_date", label: "Issue Date" },
    { key: "due_date", label: "Due Date" },
    { key: "tenant_name", label: "Tenant", render: (r) => r.tenant_name || "—" },
    { key: "lease_id", label: "Lease ID", render: (r) => r.lease_id || "—" },
    { key: "period", label: "Period", render: (r) => r.period || "—" },
    { key: "subtotal", label: "Subtotal", render: (r) => formatAmount(r.subtotal) },
    { key: "tax_amount", label: "Tax", render: (r) => formatAmount(r.tax_amount) },
    { key: "balance_due", label: "Total Due", render: (r) => formatAmount(r.balance_due) },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge
          color={
            r.status === "PAID"
              ? "emerald"
              : r.status === "OVERDUE" || r.status === "DISPUTED"
                ? "red"
                : "amber"
          }
        >
          {r.status}
        </Badge>
      ),
    },
    { key: "applied_credits", label: "Applied Credits", render: (r) => formatAmount(r.applied_credits) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`${BASE_PATH}/${r.id}`);
          }}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
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
          <Input
            type="date"
            value={filters.from_date}
            onChange={setFilter("from_date")}
            placeholder="From"
            className="w-36"
          />
          <Input
            type="date"
            value={filters.to_date}
            onChange={setFilter("to_date")}
            placeholder="To"
            className="w-36"
          />
          <Select value={filters.status} onChange={setFilter("status")} options={STATUS_OPTIONS} className="w-36" />
          {(filters.property_ids || filters.tenant_ids || filters.from_date || filters.to_date || filters.status) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="secondary" size="sm" icon={Mail} onClick={handleBulkEmail}>
              Bulk Email ({selectedIds.size})
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export
          </Button>
          <Button icon={Plus} onClick={() => navigate(`${BASE_PATH}/create`)}>
            Create Invoice
          </Button>
        </div>
      </div>
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No invoices"
            description="Create your first invoice or adjust filters."
            actionLabel="Create Invoice"
            onAction={() => navigate(`${BASE_PATH}/create`)}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onRowClick={(r) => navigate(`${BASE_PATH}/${r.id}`)}
            emptyMessage="No invoices match your filters."
          />
        )}
      </Card>
    </div>
  );
}
