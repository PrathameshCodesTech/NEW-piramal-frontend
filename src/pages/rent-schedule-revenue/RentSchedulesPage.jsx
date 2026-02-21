import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Calendar,
  FileText,
  Download,
  Plus,
  CheckCircle,
  Edit3,
  X,
  TrendingUp,
  BarChart2,
  AlertCircle,
  Percent,
} from "lucide-react";
import {
  rentSchedulesAPI,
  invoicesAPI,
  sitesAPI,
  tenantCompaniesAPI,
  agreementsAPI,
} from "../../services/api";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";

const BASE_PATH = "/rent-schedule-revenue/invoice";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "INVOICED", label: "Invoiced" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatAmount(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(2)} K`;
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function RentSchedulesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    property_ids: "",
    tenant_ids: "",
    agreement_id: "",
    status: "",
    period_from: "",
    period_to: "",
  });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showMarkInvoicedModal, setShowMarkInvoicedModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [markInvoiceId, setMarkInvoiceId] = useState("");
  const [generateForm, setGenerateForm] = useState({
    agreement_ids: [],
    period_start: "",
    period_end: "",
    charge_type: "BASE_RENT",
  });
  const [adjustForm, setAdjustForm] = useState({
    override_amount: "",
    adjustment_reason: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    sitesAPI.list().then((r) => setSites(r?.results || r || [])).catch(() => setSites([]));
    tenantCompaniesAPI.list().then((r) => setTenants(r?.results || r || [])).catch(() => setTenants([]));
    agreementsAPI.list().then((r) => setAgreements(r?.results || r || [])).catch(() => setAgreements([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.property_ids) params.property_ids = filters.property_ids;
    if (filters.tenant_ids) params.tenant_ids = filters.tenant_ids;
    if (filters.agreement_id) params.agreement_id = filters.agreement_id;
    if (filters.status) params.status = filters.status;
    if (filters.period_from) params.period_from = filters.period_from;
    if (filters.period_to) params.period_to = filters.period_to;
    Promise.all([
      rentSchedulesAPI.list(params),
      rentSchedulesAPI.kpis().catch(() => null),
    ])
      .then(([listRes, kpiRes]) => {
        setData(listRes?.results || listRes || []);
        setKpis(kpiRes);
      })
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

  const handleExport = async () => {
    try {
      const params = {};
      if (filters.property_ids) params.property_ids = filters.property_ids;
      if (filters.tenant_ids) params.tenant_ids = filters.tenant_ids;
      if (filters.agreement_id) params.agreement_id = filters.agreement_id;
      if (filters.status) params.status = filters.status;
      if (filters.period_from) params.period_from = filters.period_from;
      if (filters.period_to) params.period_to = filters.period_to;
      const blob = await rentSchedulesAPI.export(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rent-schedules.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    } catch (err) {
      toast.error(err.message || "Export failed");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateForm.agreement_ids?.length || !generateForm.period_start || !generateForm.period_end) {
      toast.error("Select at least one agreement and set period");
      return;
    }
    setActionLoading(true);
    try {
      const res = await rentSchedulesAPI.generate({
        agreement_ids: generateForm.agreement_ids,
        period_start: generateForm.period_start,
        period_end: generateForm.period_end,
        charge_type: generateForm.charge_type,
      });
      toast.success(`${res.created} schedule line(s) created`);
      setShowGenerateModal(false);
      setGenerateForm({ agreement_ids: [], period_start: "", period_end: "", charge_type: "BASE_RENT" });
      setFilters((f) => ({ ...f })); // refresh
    } catch (err) {
      toast.error(err.message || "Generate failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openMarkInvoicedModal = () => {
    if (selectedIds.size === 0) { toast.error("Select at least one line"); return; }
    setMarkInvoiceId("");
    setShowMarkInvoicedModal(true);
    setInvoicesLoading(true);
    invoicesAPI.list()
      .then((r) => setInvoices(r?.results || r || []))
      .catch(() => setInvoices([]))
      .finally(() => setInvoicesLoading(false));
  };

  const handleMarkInvoiced = async (e) => {
    e.preventDefault();
    if (!markInvoiceId) { toast.error("Select an invoice"); return; }
    setActionLoading(true);
    try {
      const res = await rentSchedulesAPI.markInvoiced({
        line_ids: [...selectedIds],
        invoice_id: parseInt(markInvoiceId, 10),
      });
      toast.success(`${res.updated ?? res.count ?? selectedIds.size} line(s) marked as invoiced`);
      setShowMarkInvoicedModal(false);
      setMarkInvoiceId("");
      setSelectedIds(new Set());
      setFilters((f) => ({ ...f }));
    } catch (err) {
      toast.error(err.message || "Mark invoiced failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustAmounts = async (e) => {
    e.preventDefault();
    if (selectedIds.size === 0) {
      toast.error("Select at least one line");
      return;
    }
    if (!adjustForm.override_amount || parseFloat(adjustForm.override_amount) < 0) {
      toast.error("Enter valid override amount");
      return;
    }
    setActionLoading(true);
    try {
      const res = await rentSchedulesAPI.adjustAmounts({
        line_ids: [...selectedIds],
        override_amount: parseFloat(adjustForm.override_amount),
        adjustment_reason: adjustForm.adjustment_reason || "",
      });
      toast.success(`${res.updated} line(s) adjusted`);
      setShowAdjustModal(false);
      setAdjustForm({ override_amount: "", adjustment_reason: "" });
      setSelectedIds(new Set());
      setFilters((f) => ({ ...f }));
    } catch (err) {
      toast.error(err.message || "Adjust failed");
    } finally {
      setActionLoading(false);
    }
  };

  const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const clearFilters = () =>
    setFilters({
      property_ids: "",
      tenant_ids: "",
      agreement_id: "",
      status: "",
      period_from: "",
      period_to: "",
    });

  const propertyOptions = sites.map((s) => ({ value: String(s.id), label: s.name || s.site_name || `Site ${s.id}` }));
  const tenantOptions = tenants.map((t) => ({ value: String(t.id), label: t.legal_name || `Tenant ${t.id}` }));
  const agreementOptions = agreements.map((a) => ({
    value: a.id,
    label: a.lease_id ? `${a.lease_id}${a.tenant_name ? ` - ${a.tenant_name}` : ""}` : `Agreement #${a.id}`,
  }));

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
    { key: "id", label: "Schedule ID", render: (r) => r.id },
    { key: "lease_id", label: "Lease / Property / Unit", render: (r) => `${r.lease_id || "—"} / ${r.site_name || "—"} / ${r.unit_label || "—"}` },
    { key: "tenant_name", label: "Tenant", render: (r) => r.tenant_name || "—" },
    { key: "period", label: "Period", render: (r) => r.period || "—" },
    { key: "charge_type", label: "Charge Type", render: (r) => r.charge_type?.replace("_", " ") || "—" },
    { key: "amount_before_tax", label: "Amt Before Tax", render: (r) => formatAmount(r.amount_before_tax) },
    { key: "gst", label: "GST", render: (r) => formatAmount(r.gst) },
    { key: "effective_amount", label: "Amt After Tax", render: (r) => formatAmount(r.effective_amount ?? r.amount_after_tax) },
    { key: "due_date", label: "Due Date" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge
          color={
            r.status === "PAID" ? "emerald" : r.status === "INVOICED" ? "blue" : r.status === "CANCELLED" ? "gray" : "amber"
          }
        >
          {r.status}
        </Badge>
      ),
    },
    { key: "escalation_applied", label: "Escalation", render: (r) => (r.escalation_applied ? "Yes" : "—") },
    { key: "notes", label: "Notes", render: (r) => (r.notes ? String(r.notes).slice(0, 30) + (r.notes?.length > 30 ? "…" : "") : "—") },
  ];

  return (
    <div>
      {/* KPI Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "MRR Forecast",
            value: kpis ? formatAmount(kpis.mrr_forecast) : "₹0.00",
            icon: TrendingUp,
            bg: "bg-emerald-50",
            text: "text-emerald-600",
          },
          {
            label: "MRR Trend",
            value: kpis?.mrr_trend != null ? `${kpis.mrr_trend}%` : "0%",
            icon: BarChart2,
            bg: "bg-blue-50",
            text: "text-blue-600",
          },
          {
            label: "Overdue Variance",
            value: kpis ? formatAmount(kpis.overdue_variance) : "₹0.00",
            icon: AlertCircle,
            bg: "bg-red-50",
            text: "text-red-600",
          },
          {
            label: "Overdue Trend",
            value: kpis?.overdue_trend != null ? `${kpis.overdue_trend}%` : "0%",
            icon: Percent,
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
          <Select
            value={filters.agreement_id}
            onChange={setFilter("agreement_id")}
            options={[{ value: "", label: "All Agreements" }, ...agreementOptions]}
            className="w-40"
          />
          <Select value={filters.status} onChange={setFilter("status")} options={STATUS_OPTIONS} className="w-36" />
          <Input type="date" value={filters.period_from} onChange={setFilter("period_from")} placeholder="From" className="w-36" />
          <Input type="date" value={filters.period_to} onChange={setFilter("period_to")} placeholder="To" className="w-36" />
          {(filters.property_ids || filters.tenant_ids || filters.agreement_id || filters.status || filters.period_from || filters.period_to) && (
            <button type="button" onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button variant="secondary" size="sm" icon={CheckCircle} onClick={openMarkInvoicedModal} disabled={actionLoading}>
                Mark Invoiced ({selectedIds.size})
              </Button>
              <Button variant="secondary" size="sm" icon={Edit3} onClick={() => setShowAdjustModal(true)}>
                Adjust Amounts
              </Button>
            </>
          )}
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export
          </Button>
          <Button icon={Plus} onClick={() => setShowGenerateModal(true)}>
            Generate Schedules
          </Button>
        </div>
      </div>

      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">All Rent Schedules</h4>
        </div>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No rent schedules"
            description="Generate schedules for agreements or adjust filters."
            actionLabel="Generate Schedules"
            onAction={() => setShowGenerateModal(true)}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onRowClick={(r) => navigate(`/rent-schedule-revenue/rent-schedules/${r.id}`)}
            emptyMessage="No rent schedules match your filters."
          />
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Schedules</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agreements (hold Ctrl to multi-select)</label>
                <select
                  multiple
                  value={generateForm.agreement_ids.map(String)}
                  onChange={(e) =>
                    setGenerateForm((prev) => ({
                      ...prev,
                      agreement_ids: [...e.target.selectedOptions].map((o) => parseInt(o.value, 10)),
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[100px]"
                >
                  {agreementOptions.map((a) => (
                    <option key={a.value} value={String(a.value)}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Period Start"
                type="date"
                value={generateForm.period_start}
                onChange={(e) => setGenerateForm((prev) => ({ ...prev, period_start: e.target.value }))}
                required
              />
              <Input
                label="Period End"
                type="date"
                value={generateForm.period_end}
                onChange={(e) => setGenerateForm((prev) => ({ ...prev, period_end: e.target.value }))}
                required
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" type="button" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={actionLoading}>
                  Generate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Invoiced Modal */}
      {showMarkInvoicedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Mark as Invoiced</h3>
            <p className="text-sm text-gray-500 mb-4">
              Mark <span className="font-medium text-gray-700">{selectedIds.size}</span> schedule line{selectedIds.size !== 1 ? "s" : ""} as invoiced. Select the invoice to link:
            </p>
            <form onSubmit={handleMarkInvoiced} className="space-y-4">
              {invoicesLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice <span className="text-red-500">*</span></label>
                  <select
                    value={markInvoiceId}
                    onChange={(e) => setMarkInvoiceId(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">— Select invoice —</option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {[
                          inv.invoice_number || `#${inv.id}`,
                          inv.tenant_name,
                          inv.total_amount != null ? `₹${Number(inv.total_amount).toLocaleString("en-IN")}` : null,
                          inv.status,
                        ].filter(Boolean).join(" · ")}
                      </option>
                    ))}
                  </select>
                  {invoices.length === 0 && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3">
                      <p className="text-xs text-amber-700">No invoices found for this scope. Create one first, then link it here.</p>
                      <button
                        type="button"
                        onClick={() => { setShowMarkInvoicedModal(false); navigate("/billing/invoices/create"); }}
                        className="shrink-0 text-xs font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                      >
                        Create Invoice →
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => { setShowMarkInvoicedModal(false); setMarkInvoiceId(""); }}>
                  Cancel
                </Button>
                <Button type="submit" loading={actionLoading} disabled={!markInvoiceId || invoicesLoading}>
                  Mark Invoiced
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adjust Amounts ({selectedIds.size} selected)</h3>
            <form onSubmit={handleAdjustAmounts} className="space-y-4">
              <Input
                label="Override Amount"
                type="number"
                min="0"
                step="0.01"
                value={adjustForm.override_amount}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, override_amount: e.target.value }))}
                required
              />
              <Input
                label="Adjustment Reason"
                value={adjustForm.adjustment_reason}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, adjustment_reason: e.target.value }))}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" type="button" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={actionLoading}>
                  Adjust
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
