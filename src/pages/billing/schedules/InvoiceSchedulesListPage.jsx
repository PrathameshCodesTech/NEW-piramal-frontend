import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar } from "lucide-react";
import { invoiceSchedulesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import EmptyState from "../../../components/ui/EmptyState";

export default function InvoiceSchedulesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    invoiceSchedulesAPI.list().then((r) => setData(r?.results || r || [])).catch(() => setData([])).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "schedule_name", label: "Schedule" },
    { key: "invoice_type", label: "Type" },
    { key: "frequency", label: "Frequency" },
    { key: "amount", label: "Amount" },
    { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => navigate("/billing/schedules/create")}>New Schedule</Button>
      </div>
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={Calendar} title="No invoice schedules" description="Create schedules to auto-generate invoices" actionLabel="New Schedule" onAction={() => navigate("/billing/schedules/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/billing/schedules/${r.id}`)} />
        )}
      </Card>
    </div>
  );
}
