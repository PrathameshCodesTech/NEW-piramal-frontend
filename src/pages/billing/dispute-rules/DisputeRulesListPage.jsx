import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { disputeRulesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function DisputeRulesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    disputeRulesAPI.list().then((r) => setData(r?.results || r || [])).catch(() => setData([])).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "condition_type", label: "Condition" },
    { key: "threshold_value", label: "Threshold" },
    { key: "status", label: "Status", render: (r) => <Badge color="gray">{r.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => navigate("/billing/dispute-rules/create")}>New Rule</Button>
      </div>
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState title="No dispute rules" actionLabel="New Rule" onAction={() => navigate("/billing/dispute-rules/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/billing/dispute-rules/${r.id}`)} />
        )}
      </Card>
    </div>
  );
}
