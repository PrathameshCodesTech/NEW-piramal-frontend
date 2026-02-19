import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LayoutList, ListFilter, Search } from "lucide-react";
import { agreementStructuresAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import EmptyState from "../../../components/ui/EmptyState";

export default function AgreementStructuresListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    agreementStructuresAPI
      .list({ q: search || undefined })
      .then((r) => setData(r?.results || r || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [search]);

  const handleSearchChange = (e) => {
    setLoading(true);
    setSearch(e.target.value);
  };

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "description",
      label: "Description",
      render: (row) =>
        row.description
          ? row.description.substring(0, 60) + (row.description.length > 60 ? "…" : "")
          : "-",
    },
    { key: "sections_count", label: "Sections", render: (row) => row.sections_count ?? "-" },
    {
      key: "is_default",
      label: "Default",
      render: (row) =>
        row.is_default ? (
          <Badge color="emerald">Default</Badge>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Filter</h4>
          </div>
          <Button icon={Plus} onClick={() => navigate("/leases/agreement-structures/create")}>
            New Structure
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            icon={Search}
            placeholder="Search structures..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={LayoutList}
            title="No agreement structures"
            description="Create document section templates to organize clauses in lease agreements."
            actionLabel="New Structure"
            onAction={() => navigate("/leases/agreement-structures/create")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onRowClick={(row) => navigate(`/leases/agreement-structures/${row.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
