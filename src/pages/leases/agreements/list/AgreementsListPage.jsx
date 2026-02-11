import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileCheck } from "lucide-react";
import { agreementsAPI, sitesAPI, tenantCompaniesAPI } from "../../../../services/api";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import DataTable from "../../../../components/ui/DataTable";
import Badge from "../../../../components/ui/Badge";
import Input from "../../../../components/ui/Input";
import EmptyState from "../../../../components/ui/EmptyState";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "TERMINATED", label: "Terminated" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "COMMERCIAL_RETAIL", label: "Commercial Retail" },
  { value: "OFFICE", label: "Office" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "RESIDENTIAL", label: "Residential" },
];

const statusColor = (status) => {
  if (status === "ACTIVE") return "emerald";
  if (status === "PENDING") return "amber";
  if (status === "DRAFT") return "blue";
  if (status === "TERMINATED") return "red";
  return "gray";
};

export default function AgreementsListPage() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");

  useEffect(() => {
    tenantCompaniesAPI.list().then((r) => setTenants(r?.results || r || [])).catch(() => setTenants([]));
    sitesAPI.list().then((r) => setSites(r?.results || r || [])).catch(() => setSites([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    agreementsAPI
      .list({
        q: search || undefined,
        status: statusFilter || undefined,
        agreement_type: typeFilter || undefined,
        tenant_id: tenantFilter || undefined,
        site_id: siteFilter || undefined,
      })
      .then((r) => setAgreements(r?.results || r || []))
      .catch(() => setAgreements([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, typeFilter, tenantFilter, siteFilter]);

  const columns = [
    { key: "lease_id", label: "Lease ID" },
    { key: "version_number", label: "Version", render: (r) => `v${r.version_number || 1}` },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge color={statusColor(r.status)}>{r.status}</Badge>,
    },
    { key: "agreement_type", label: "Type" },
    { key: "tenant_name", label: "Tenant" },
    { key: "site_name", label: "Site" },
    {
      key: "monthly_rent",
      label: "Monthly Rent",
      render: (r) =>
        r.monthly_rent !== null && r.monthly_rent !== undefined
          ? Number(r.monthly_rent).toLocaleString()
          : "-",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Search lease / tenant / site..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {tenants.length > 0 && (
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Tenants</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.legal_name}
              </option>
            ))}
          </select>
        )}

        {sites.length > 0 && (
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.code}
              </option>
            ))}
          </select>
        )}

        <div className="ml-auto">
          <Button icon={Plus} onClick={() => navigate("/leases/agreements/create")}>
            New Agreement
          </Button>
        </div>
      </div>

      <Card>
        {!loading && agreements.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No agreements"
            description="Create your first lease agreement"
            actionLabel="New Agreement"
            onAction={() => navigate("/leases/agreements/create")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={agreements}
            loading={loading}
            onRowClick={(r) => navigate(`/leases/agreements/${r.id}`)}
          />
        )}
      </Card>
    </div>
  );
}


