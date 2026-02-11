import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { clauseDocumentsAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import EmptyState from "../../../components/ui/EmptyState";

const DOC_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "PDF", label: "PDF" },
  { value: "DOCX", label: "Word" },
  { value: "XLSX", label: "Excel" },
  { value: "IMAGE", label: "Image" },
  { value: "OTHER", label: "Other" },
];

export default function ClauseDocumentsListPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (typeFilter) params.document_type = typeFilter;
    clauseDocumentsAPI.list(params).then((r) => setDocuments(r?.results || r || [])).catch(() => setDocuments([])).finally(() => setLoading(false));
  }, [search, typeFilter]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "document_type", label: "Type", render: (row) => <Badge color="blue">{row.document_type || "—"}</Badge> },
    { key: "file_size", label: "Size", render: (row) => (row.file_size ? `${(row.file_size / 1024).toFixed(1)} KB` : "—") },
    { key: "linked_clauses", label: "Linked Clauses", render: (row) => {
      const links = row.linked_clauses || [];
      return links.length ? links.map((l) => l.clause_title || "—").join(", ") : "—";
    }},
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500">
          {DOC_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="ml-auto">
          <Button icon={Plus} onClick={() => navigate("/clauses/documents/upload")}>Upload Document</Button>
        </div>
      </div>
      <Card>
        {!loading && documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents yet" description="Upload clause-related documents" actionLabel="Upload Document" onAction={() => navigate("/clauses/documents/upload")} />
        ) : (
          <DataTable columns={columns} data={documents} loading={loading} onRowClick={(r) => navigate(`/clauses/documents/${r.id}`)} />
        )}
      </Card>
    </div>
  );
}
