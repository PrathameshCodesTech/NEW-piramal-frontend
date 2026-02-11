import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ListTodo } from "lucide-react";
import { invoicesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function InvoicesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    invoicesAPI.list().then((r) => setData(r?.results || r || [])).catch(() => setData([])).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "invoice_number", label: "Invoice #" },
    { key: "invoice_type", label: "Type" },
    { key: "tenant_name", label: "Tenant", render: (r) => r.tenant_name || "" },
    { key: "invoice_date", label: "Date" },
    { key: "total_amount", label: "Amount" },
    { key: "status", label: "Status", render: (r) => <Badge color={r.status === "PAID" ? "emerald" : "amber"}>{r.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
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
