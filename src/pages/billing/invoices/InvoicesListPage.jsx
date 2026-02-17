import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, ListTodo, X } from "lucide-react";
import { invoicesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function InvoicesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const overdueFilter = searchParams.get("overdue") === "true";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (overdueFilter) params.overdue = "true";
    invoicesAPI.list(params).then((r) => setData(r?.results || r || [])).catch(() => setData([])).finally(() => setLoading(false));
  }, [statusFilter, overdueFilter]);

  const columns = [
    { key: "invoice_number", label: "Invoice #" },
    { key: "invoice_type", label: "Type" },
    { key: "tenant_name", label: "Tenant", render: (r) => r.tenant_name || "" },
    { key: "invoice_date", label: "Date" },
    { key: "total_amount", label: "Amount" },
    { key: "status", label: "Status", render: (r) => <Badge color={r.status === "PAID" ? "emerald" : "amber"}>{r.status}</Badge> },
  ];

  const clearFilters = () => setSearchParams({});

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {(statusFilter || overdueFilter) && (
            <span className="text-sm text-gray-600 flex items-center gap-2">
              {statusFilter && <Badge color="blue">{statusFilter}</Badge>}
              {overdueFilter && <Badge color="amber">Overdue</Badge>}
              <button type="button" onClick={clearFilters} className="text-gray-400 hover:text-gray-600" title="Clear filters">
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
        </div>
        <Button icon={Plus} onClick={() => navigate("/billing/invoices/create")}>New Invoice</Button>
      </div>
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={ListTodo} title="No invoices" description="Create invoices" actionLabel="New Invoice" onAction={() => navigate("/billing/invoices/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/billing/invoices/${r.id}`)} />
        )}
      </Card>
    </div>
  );
}
