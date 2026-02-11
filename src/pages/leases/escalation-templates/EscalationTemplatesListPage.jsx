import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, ListFilter, Search } from "lucide-react";
import { escalationTemplatesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import EmptyState from "../../../components/ui/EmptyState";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "FIXED_PERCENT", label: "Fixed %" },
  { value: "INDEX_LINKED", label: "Index Linked" },
  { value: "STEP_WISE", label: "Step Wise" },
];

export default function EscalationTemplatesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    escalationTemplatesAPI
      .list({
        q: search || undefined,
        status: statusFilter || undefined,
        escalation_type: typeFilter || undefined,
      })
      .then((r) => setData(r?.results || r || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, typeFilter]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "escalation_type", label: "Type" },
    { key: "frequency", label: "Frequency" },
    { key: "applicability", label: "Applicability" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge color={row.status === "ACTIVE" ? "emerald" : row.status === "DRAFT" ? "amber" : "gray"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      {/* Filter Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Filter</h4>
          </div>
          <Button icon={Plus} onClick={() => navigate("/leases/escalation-templates/create")}>
            New Template
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            icon={Search}
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={TYPE_OPTIONS}
          />
        </div>
      </div>

      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No escalation templates"
            description="Create reusable escalation templates for lease terms."
            actionLabel="New Template"
            onAction={() => navigate("/leases/escalation-templates/create")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onRowClick={(row) => navigate(`/leases/escalation-templates/${row.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
