import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, History, ListFilter, Search } from "lucide-react";
import { agreementsAPI, leaseAmendmentsAPI } from "../../../services/api";
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
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "EXECUTED", label: "Executed" },
  { value: "REJECTED", label: "Rejected" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "RENT_REVISION", label: "Rent Revision" },
  { value: "AREA_CHANGE", label: "Area Change" },
  { value: "TERM_EXTENSION", label: "Term Extension" },
  { value: "RENEWAL", label: "Renewal" },
  { value: "EARLY_TERMINATION", label: "Early Termination" },
  { value: "CLAUSE_MODIFICATION", label: "Clause Modification" },
  { value: "OTHER", label: "Other" },
];

const statusColor = (status) => {
  if (status === "APPROVED" || status === "EXECUTED") return "emerald";
  if (status === "REJECTED") return "red";
  if (status === "DRAFT") return "blue";
  return "amber";
};

export default function AmendmentsListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [agreementFilter, setAgreementFilter] = useState("");

  useEffect(() => {
    agreementsAPI.list().then((r) => setAgreements(r?.results || r || [])).catch(() => setAgreements([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    leaseAmendmentsAPI
      .list({
        q: search || undefined,
        approval_status: statusFilter || undefined,
        amendment_type: typeFilter || undefined,
        agreement_id: agreementFilter || undefined,
      })
      .then((r) => setData(r?.results || r || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, typeFilter, agreementFilter]);

  const agreementOptions = [
    { value: "", label: "All Agreements" },
    ...agreements.map((a) => ({ value: String(a.id), label: a.lease_id || `Agreement ${a.id}` })),
  ];

  const columns = [
    { key: "amendment_id", label: "Amendment ID" },
    { key: "agreement_lease_id", label: "Agreement" },
    { key: "title", label: "Title" },
    { key: "amendment_type", label: "Type" },
    { key: "new_version", label: "New Version" },
    {
      key: "effective_from",
      label: "Effective",
      render: (r) => (r.effective_from ? new Date(r.effective_from).toLocaleDateString() : "-"),
    },
    {
      key: "approval_status",
      label: "Status",
      render: (r) => <Badge color={statusColor(r.approval_status)}>{r.approval_status}</Badge>,
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
          <Button icon={Plus} onClick={() => navigate("/leases/amendments/create")}>
            New Amendment
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            icon={Search}
            placeholder="Search amendments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
          <Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={TYPE_OPTIONS} />
          {agreements.length > 0 && (
            <Select label="Agreement" value={agreementFilter} onChange={(e) => setAgreementFilter(e.target.value)} options={agreementOptions} />
          )}
        </div>
      </div>

      <Card>
        {!loading && data.length === 0 ? (
          <EmptyState
            icon={History}
            title="No amendments"
            description="Track and manage lease amendments."
            actionLabel="New Amendment"
            onAction={() => navigate("/leases/amendments/create")}
          />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} onRowClick={(row) => navigate(`/leases/amendments/${row.id}`)} />
        )}
      </Card>
    </div>
  );
}
