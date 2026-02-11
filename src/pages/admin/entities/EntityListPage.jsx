import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin } from "lucide-react";
import { entitiesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function EntityListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { entitiesAPI.list().then((res) => { setData(res?.results || res || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "company_name", label: "Company", render: (row) => row.company_name || row.company || "—" },
    { key: "legal_name", label: "Legal Name" },
    { key: "city", label: "City" },
    { key: "is_active", label: "Status", render: (row) => <Badge color={row.is_active ? "emerald" : "red"}>{row.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Entities" subtitle="Manage entities" backTo="/admin" actions={<Button icon={Plus} onClick={() => navigate("/admin/entities/create")}>Create Entity</Button>} />
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={MapPin} title="No entities yet" actionLabel="Create Entity" onAction={() => navigate("/admin/entities/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/admin/entities/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
