import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, ListFilter, Search } from "lucide-react";
import { tenantCompaniesAPI } from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default function TenantListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tenantCompaniesAPI.list({ q: search || undefined, status: statusFilter || undefined });
      setData(res?.results || res || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: "legal_name", label: "Legal Name" },
    { key: "trade_name", label: "Trade Name" },
    { key: "city", label: "City" },
    { key: "industry", label: "Industry" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge color={row.status === "ACTIVE" ? "emerald" : row.status === "SUSPENDED" ? "red" : "gray"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold text-gray-800">Tenants</h1>
          <span className="text-sm text-gray-400">—</span>
          <p className="text-sm text-gray-500">Manage tenant companies</p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/tenants/create")}>Create Tenant</Button>
      </div>

      {/* Filter Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ListFilter className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Filter</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            icon={Search}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No tenants yet"
            description="Create your first tenant company"
            actionLabel="Create Tenant"
            onAction={() => navigate("/tenants/create")}
          />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/tenants/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
