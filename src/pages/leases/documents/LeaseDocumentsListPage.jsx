import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, ListFilter, Search } from "lucide-react";
import { agreementsAPI, leaseLinkedDocumentsAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import EmptyState from "../../../components/ui/EmptyState";

const VIEW_OPTIONS = [
  { value: "all", label: "All" },
  { value: "expiring", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
];

export default function LeaseDocumentsListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [agreementFilter, setAgreementFilter] = useState("");

  useEffect(() => {
    agreementsAPI.list().then((r) => setAgreements(r?.results || r || [])).catch(() => setAgreements([]));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (viewType === "expiring") { const res = await leaseLinkedDocumentsAPI.expiring(); setData(res?.results || res || []); return; }
        if (viewType === "expired") { const res = await leaseLinkedDocumentsAPI.expired(); setData(res?.results || res || []); return; }
        const res = await leaseLinkedDocumentsAPI.list({
          q: search || undefined, status: statusFilter || undefined,
          category: categoryFilter || undefined, agreement_id: agreementFilter || undefined,
        });
        setData(res?.results || res || []);
      } catch { setData([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [viewType, search, statusFilter, categoryFilter, agreementFilter]);

  const agreementOptions = [
    { value: "", label: "All Agreements" },
    ...agreements.map((a) => ({ value: String(a.id), label: a.lease_id || `Agreement ${a.id}` })),
  ];

  const columns = [
    { key: "title", label: "Title" },
    { key: "agreement", label: "Agreement" },
    { key: "category", label: "Category" },
    {
      key: "status", label: "Status",
      render: (r) => (
        <Badge color={r.status === "VALID" || r.status === "EXECUTED" ? "emerald" : r.status === "EXPIRING" || r.status === "PENDING_REVIEW" ? "amber" : r.status === "EXPIRED" ? "red" : "gray"}>
          {r.status}
        </Badge>
      ),
    },
    { key: "version", label: "Version" },
    { key: "expiry_date", label: "Expiry", render: (r) => (r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : "-") },
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
          <Button icon={Plus} onClick={() => navigate("/leases/documents/create")}>
            New Document
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select label="View" value={viewType} onChange={(e) => setViewType(e.target.value)} options={VIEW_OPTIONS} />
          {viewType === "all" && (
            <>
              <Input icon={Search} placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <Input placeholder="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
              <Input placeholder="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />
              {agreements.length > 0 && (
                <Select label="Agreement" value={agreementFilter} onChange={(e) => setAgreementFilter(e.target.value)} options={agreementOptions} />
              )}
            </>
          )}
        </div>
      </div>

      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No linked documents"
            description="Create and track lease document validity and approvals."
            actionLabel="New Document"
            onAction={() => navigate("/leases/documents/create")}
          />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/leases/documents/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
