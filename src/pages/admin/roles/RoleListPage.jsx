import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, UserCog } from "lucide-react";
import { rolesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function RoleListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { rolesAPI.list().then((res) => { setData(res?.results || res || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "scope_name", label: "Scope", render: (row) => row.scope_name || row.scope || "—" },
    { key: "description", label: "Description" },
    { key: "is_active", label: "Status", render: (row) => <Badge color={row.is_active ? "emerald" : "red"}>{row.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Roles" subtitle="Manage roles" backTo="/admin" actions={<Button icon={Plus} onClick={() => navigate("/admin/roles/create")}>Create Role</Button>} />
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={UserCog} title="No roles yet" actionLabel="Create Role" onAction={() => navigate("/admin/roles/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/admin/roles/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
