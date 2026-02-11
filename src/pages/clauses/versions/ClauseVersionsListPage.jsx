import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clauseVersionsAPI, clausesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import { History } from "lucide-react";

export default function ClauseVersionsListPage() {
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clauseFilter, setClauseFilter] = useState("");

  useEffect(() => {
    clausesAPI.list().then((r) => setClauses(r?.results || r || [])).catch(() => setClauses([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = clauseFilter ? { clause: clauseFilter } : {};
    clauseVersionsAPI.list(params).then((r) => setVersions(r?.results || r || [])).catch(() => setVersions([])).finally(() => setLoading(false));
  }, [clauseFilter]);

  const columns = [
    {
      key: "clause",
      label: "Clause",
      render: (row) => row.clause_title || row.clause?.title || row.clause_id_display || "—",
    },
    {
      key: "version_label",
      label: "Version",
      render: (row) => row.version_label || `v${row.major_version}.${row.minor_version}`,
    },
    {
      key: "version_status",
      label: "Status",
      render: (row) => (
        <Badge color={row.version_status === "CURRENT" ? "emerald" : "gray"}>
          {row.version_status}
        </Badge>
      ),
    },
    { key: "change_summary", label: "Change Summary", render: (r) => r.change_summary || "—" },
    {
      key: "created_at",
      label: "Created",
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {clauses.length > 0 && (
          <select
            value={clauseFilter}
            onChange={(e) => setClauseFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Clauses</option>
            {clauses.map((c) => (
              <option key={c.id} value={c.id}>{c.clause_id || c.id} - {c.title}</option>
            ))}
          </select>
        )}
      </div>
      <Card>
        {!loading && versions.length === 0 ? (
          <EmptyState icon={History} title="No versions yet" description="Version history appears when you bump clause versions" />
        ) : (
          <DataTable
            columns={columns}
            data={versions}
            loading={loading}
            onRowClick={(r) => r.clause && navigate(`/clauses/clauses/${r.clause}`)}
          />
        )}
      </Card>
    </div>
  );
}
