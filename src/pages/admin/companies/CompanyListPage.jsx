import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Layers } from "lucide-react";
import { companiesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function CompanyListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesAPI.list().then((res) => { setData(res?.results || res || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const columns = [
    { key: "name", label: "Name" },
    { key: "org_name", label: "Organization", render: (row) => row.org_name || row.org || "—" },
    { key: "legal_name", label: "Legal Name" },
    { key: "city", label: "City" },
    { key: "is_active", label: "Status", render: (row) => <Badge color={row.is_active ? "emerald" : "red"}>{row.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Companies" subtitle="Manage companies" backTo="/admin" actions={<Button icon={Plus} onClick={() => navigate("/admin/companies/create")}>Create Company</Button>} />
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState icon={Layers} title="No companies yet" description="Create your first company" actionLabel="Create Company" onAction={() => navigate("/admin/companies/create")} />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/admin/companies/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
