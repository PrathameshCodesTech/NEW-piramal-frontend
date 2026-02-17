import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2 } from "lucide-react";
import { orgsAPI } from "../../../services/api";
import { useOrgStructureBasePath } from "../../../contexts/OrgStructureContext";
import { useAuth } from "../../../contexts/AuthContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function OrgListPage() {
  const navigate = useNavigate();
  const basePath = useOrgStructureBasePath();
  const { user } = useAuth();
  const canCreateOrg = user?.is_superuser && basePath === "/admin";
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
        subtitle={basePath === "/org-structure" ? "Organizations in your scope" : "Manage platform organizations"}
        backTo={basePath === "/org-structure" ? basePath : "/admin"}
        actions={canCreateOrg ? <Button icon={Plus} onClick={() => navigate(`${basePath}/orgs/create`)}>Create Org</Button> : null}
      />
      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No organizations yet"
            description="Create your first organization to get started"
            actionLabel={canCreateOrg ? "Create Org" : undefined}
            onAction={canCreateOrg ? () => navigate(`${basePath}/orgs/create`) : undefined}
          />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`${basePath}/orgs/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
