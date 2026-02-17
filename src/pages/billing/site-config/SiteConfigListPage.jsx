import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Plus } from "lucide-react";
import { sitesAPI, siteBillingConfigAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import EmptyState from "../../../components/ui/EmptyState";

export default function SiteConfigListPage() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      sitesAPI.list().then((r) => r?.results || r || []),
      siteBillingConfigAPI.list().then((r) => r?.results || r || []),
    ])
      .then(([s, c]) => {
        setSites(s);
        setConfigs(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const siteConfigMap = {};
  configs.forEach((c) => {
    if (c.site) siteConfigMap[c.site] = c;
  });

  const columns = [
    { key: "name", label: "Site Name", render: (r) => r.name || r.code || "—" },
    { key: "code", label: "Code" },
    {
      key: "has_config",
      label: "Billing Config",
      render: (r) => (siteConfigMap[r.id] ? "Configured" : "—"),
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={() => navigate("/billing/site-config/create")}>
          Create Site Config
        </Button>
      </div>
      <Card>
        {!loading && sites.length === 0 ? (
          <EmptyState icon={Settings} title="No sites" description="Create sites in Properties first" />
        ) : (
          <DataTable
            columns={columns}
            data={sites}
            loading={loading}
            onRowClick={(r) => navigate(`/billing/site-config/${r.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
