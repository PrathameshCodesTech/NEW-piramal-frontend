import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2 } from "lucide-react";
import { orgsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function OrgListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orgsAPI.list().then((res) => {
      setData(res?.results || res || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "legal_name", label: "Legal Name" },
    { key: "city", label: "City" },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <Badge color={row.is_active ? "emerald" : "red"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Organizations"
        subtitle="Manage platform organizations"
        backTo="/admin"
        actions={<Button icon={Plus} onClick={() => navigate("/admin/orgs/create")}>Create Org</Button>}
      />
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No organizations yet"
            description="Create your first organization to get started"
            actionLabel="Create Org"
            onAction={() => navigate("/admin/orgs/create")}
          />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/admin/orgs/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
