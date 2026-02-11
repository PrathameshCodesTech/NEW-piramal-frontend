import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, FolderPlus } from "lucide-react";
import { clausesAPI, clauseCategoriesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import EmptyState from "../../../components/ui/EmptyState";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "INACTIVE", label: "Inactive" },
];

const APPLIES_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "ALL", label: "All" },
];

export default function ClausesListPage() {
  const navigate = useNavigate();
  const [clauses, setClauses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [appliesFilter, setAppliesFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    clauseCategoriesAPI.list().then((r) => setCategories(r?.results || r || [])).catch(() => setCategories([]));
    clausesAPI.list({ search: search || undefined, status: statusFilter || undefined, category: categoryFilter || undefined, applies_to: appliesFilter || undefined })
      .then((r) => setClauses(r?.results || r || []))
      .catch(() => setClauses([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter, appliesFilter]);

  const statusColor = (s) => (s === "ACTIVE" ? "emerald" : s === "DRAFT" ? "amber" : s === "ARCHIVED" ? "gray" : "red");

  const columns = [
    { key: "clause_id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "category_name", label: "Category", render: (r) => r.category_name || r.category_detail?.name || "" },
    { key: "applies_to", label: "Applies To", render: (r) => <Badge color={r.applies_to === "ALL" ? "purple" : "blue"}>{r.applies_to}</Badge> },
    { key: "version", label: "Version", render: (r) => `v${r.current_version || 1}.${r.current_minor_version || 0}` },
    { key: "status", label: "Status", render: (r) => <Badge color={statusColor(r.status)}>{r.status}</Badge> },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search clauses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={appliesFilter} onChange={(e) => setAppliesFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500">
          {APPLIES_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {categories.length > 0 && (
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" icon={FolderPlus} onClick={() => navigate("/clauses/categories/create")}>New Category</Button>
          <Button icon={Plus} onClick={() => navigate("/clauses/clauses/create")}>New Clause</Button>
        </div>
      </div>
      <Card>
        {!loading && clauses.length === 0 ? (
          <EmptyState icon={BookOpen} title="No clauses yet" description="Create your first clause template" actionLabel="New Clause" onAction={() => navigate("/clauses/clauses/create")} />
        ) : (
          <DataTable columns={columns} data={clauses} loading={loading} onRowClick={(r) => navigate(`/clauses/clauses/${r.id}`)} />
        )}
      </Card>
    </div>
  );
}
