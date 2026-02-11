import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { usersAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function UserListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { usersAPI.list().then((res) => { setData(res?.results || res || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "is_active", label: "Status", render: (row) => <Badge color={row.is_active ? "emerald" : "red"}>{row.is_active ? "Active" : "Inactive"}</Badge> },
    { key: "is_superuser", label: "Admin", render: (row) => row.is_superuser ? <Badge color="purple">Admin</Badge> : null },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage platform users" backTo="/admin" actions={<Button icon={Plus} onClick={() => navigate("/admin/users/create")}>Create User</Button>} />
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={Users} title="No users yet" actionLabel="Create User" onAction={() => navigate("/admin/users/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/admin/users/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
