import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ShieldCheck } from "lucide-react";
import { scopesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

const typeColors = { ORG: "emerald", COMPANY: "blue", ENTITY: "purple", SITE: "amber" };

export default function ScopeListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { scopesAPI.list().then((res) => { setData(res?.results || res || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "scope_type", label: "Type", render: (row) => <Badge color={typeColors[row.scope_type] || "gray"}>{row.scope_type}</Badge> },
    { key: "is_active", label: "Status", render: (row) => <Badge color={row.is_active ? "emerald" : "red"}>{row.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Scopes" subtitle="Manage tenant scopes" backTo="/admin" actions={<Button icon={Plus} onClick={() => navigate("/admin/scopes/create")}>Create Scope</Button>} />
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No scopes yet" actionLabel="Create Scope" onAction={() => navigate("/admin/scopes/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/admin/scopes/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
