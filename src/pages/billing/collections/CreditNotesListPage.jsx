import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { creditNotesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function CreditNotesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    creditNotesAPI.list().then((r) => setData(r?.results || r || [])).catch(() => setData([])).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "credit_note_number", label: "Credit Note #" },
    { key: "amount", label: "Amount" },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", render: (r) => <Badge color="gray">{r.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => navigate("/billing/collections/credit-notes/create")}>New Credit Note</Button>
      </div>
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState title="No credit notes" actionLabel="New Credit Note" onAction={() => navigate("/billing/collections/credit-notes/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/billing/collections/credit-notes/${r.id}`)} />
        )}
      </Card>
    </div>
  );
}
