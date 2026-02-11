import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CreditCard } from "lucide-react";
import { paymentsAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function PaymentsListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    paymentsAPI.list().then((r) => setData(r?.results || r || [])).catch(() => setData([])).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "payment_number", label: "Payment #" },
    { key: "payment_date", label: "Date" },
    { key: "amount", label: "Amount" },
    { key: "payment_method", label: "Method" },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge color={r.status === "CONFIRMED" ? "emerald" : r.status === "REVERSED" ? "red" : "gray"}>{r.status}</Badge>,
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => navigate("/billing/collections/payments/create")}>Record Payment</Button>
      </div>
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments" description="Record payments against invoices" actionLabel="Record Payment" onAction={() => navigate("/billing/collections/payments/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/billing/collections/payments/${r.id}`)} />
        )}
      </Card>
    </div>
  );
}
