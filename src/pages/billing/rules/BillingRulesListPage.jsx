import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { billingRulesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function BillingRulesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    billingRulesAPI
      .list()
      .then((r) => setData(r?.results || r || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "rule_id", label: "Rule ID" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "applies_to", label: "Applies To" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge color={r.status === "ACTIVE" ? "emerald" : r.status === "DRAFT" ? "amber" : "gray"}>
          {r.status}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => navigate("/billing/rules/create")}>
          New Rule
        </Button>
      </div>
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No billing rules"
            description="Create master billing rules"
            actionLabel="New Rule"
            onAction={() => navigate("/billing/rules/create")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onRowClick={(r) => navigate(`/billing/rules/${r.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
