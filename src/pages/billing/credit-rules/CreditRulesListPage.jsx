import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Percent } from "lucide-react";
import { creditRulesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function CreditRulesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    creditRulesAPI.list().then((r) => setData(r?.results || r || [])).catch(() => setData([])).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "trigger_type", label: "Trigger" },
    { key: "approval_level", label: "Approval" },
    { key: "status", label: "Status", render: (r) => <Badge color={r.status === "ACTIVE" ? "emerald" : "gray"}>{r.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => navigate("/billing/credit-rules/create")}>New Rule</Button>
      </div>
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={Percent} title="No credit rules" actionLabel="New Rule" onAction={() => navigate("/billing/credit-rules/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/billing/credit-rules/${r.id}`)} />
        )}
      </Card>
    </div>
  );
}
