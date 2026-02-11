import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Link2 } from "lucide-react";
import { membershipsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function MembershipListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { membershipsAPI.list().then((res) => { setData(res?.results || res || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const columns = [
    { key: "user_username", label: "User", render: (row) => row.user_username || row.user || "—" },
    { key: "scope_name", label: "Scope", render: (row) => row.scope_name || row.scope || "—" },
    { key: "role_name", label: "Role", render: (row) => row.role_name || row.role || "—" },
    { key: "is_active", label: "Status", render: (row) => <Badge color={row.is_active ? "emerald" : "red"}>{row.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Memberships" subtitle="User-Scope-Role assignments" backTo="/admin" actions={<Button icon={Plus} onClick={() => navigate("/admin/memberships/create")}>Create Membership</Button>} />
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={Link2} title="No memberships yet" actionLabel="Create Membership" onAction={() => navigate("/admin/memberships/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} />
        )}
      </Card>
    </div>
  );
}
