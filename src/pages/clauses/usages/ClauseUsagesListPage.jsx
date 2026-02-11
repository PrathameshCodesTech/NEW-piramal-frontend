import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Link2 } from "lucide-react";
import {
  clauseUsagesAPI,
  clausesAPI,
  agreementsAPI,
} from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import EmptyState from "../../../components/ui/EmptyState";

export default function ClauseUsagesListPage() {
  const navigate = useNavigate();
  const [usages, setUsages] = useState([]);
  const [clauses, setClauses] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clauseFilter, setClauseFilter] = useState("");
  const [agreementFilter, setAgreementFilter] = useState("");

  useEffect(() => {
    clausesAPI.list().then((r) => setClauses(r?.results || r || [])).catch(() => setClauses([]));
    agreementsAPI.list().then((r) => setAgreements(r?.results || r || [])).catch(() => setAgreements([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (clauseFilter) params.clause = clauseFilter;
    if (agreementFilter) params.agreement = agreementFilter;
    clauseUsagesAPI
      .list(params)
      .then((r) => setUsages(r?.results || r || []))
      .catch(() => setUsages([]))
      .finally(() => setLoading(false));
  }, [clauseFilter, agreementFilter]);

  const columns = [
    {
      key: "clause_title",
      label: "Clause",
      render: (row) => row.clause_title || row.clause?.title || "—",
    },
    {
      key: "agreement_lease_id",
      label: "Agreement",
      render: (row) => row.agreement_lease_id || row.agreement?.lease_id || "—",
    },
    {
      key: "version_label",
      label: "Version",
      render: (row) => row.version_label || "—",
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
              <option key={c.id} value={c.id}>
                {c.clause_id || c.id} - {c.title}
              </option>
            ))}
          </select>
        )}
        {agreements.length > 0 && (
          <select
            value={agreementFilter}
            onChange={(e) => setAgreementFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Agreements</option>
            {agreements.map((a) => (
              <option key={a.id} value={a.id}>
                {a.lease_id || a.id}
              </option>
            ))}
          </select>
        )}
        <div className="ml-auto">
          <Button icon={Plus} onClick={() => navigate("/clauses/usages/create")}>
            Attach Clause to Agreement
          </Button>
        </div>
      </div>
      <Card>
        {!loading && usages.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No usages yet"
            description="Attach clauses to agreements"
            actionLabel="Attach Clause"
            onAction={() => navigate("/clauses/usages/create")}
          />
        ) : (
          <DataTable columns={columns} data={usages} loading={loading} />
        )}
      </Card>
    </div>
  );
}
