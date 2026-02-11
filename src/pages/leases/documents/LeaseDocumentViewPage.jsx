import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Hash, ClipboardCheck } from "lucide-react";
import { documentApprovalsAPI, leaseLinkedDocumentsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";

export default function LeaseDocumentViewPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStep, setSavingStep] = useState(false);
  const [stepForm, setStepForm] = useState({ step_order: "1", step_name: "", approver_role: "" });

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const [docRes, approvalRes] = await Promise.all([
        leaseLinkedDocumentsAPI.get(id),
        documentApprovalsAPI.list({ document_id: id }).catch(() => []),
      ]);
      setData(docRes);
      setApprovals(approvalRes?.results || approvalRes || []);
    } catch { setData(null); setApprovals([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const createStep = async (e) => {
    e.preventDefault(); setSavingStep(true);
    try {
      await documentApprovalsAPI.create({ document: parseInt(id, 10), step_order: Number(stepForm.step_order || 1), step_name: stepForm.step_name, approver_role: stepForm.approver_role });
      toast.success("Approval step added");
      setStepForm({ step_order: "1", step_name: "", approver_role: "" });
      await fetchDetail();
    } catch (err) { toast.error(err.message); }
    finally { setSavingStep(false); }
  };

  const runApprovalAction = async (approvalId, action) => {
    try { await documentApprovalsAPI.action(approvalId, { action }); toast.success(`Approval ${action}`); await fetchDetail(); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Document not found.</div>;

  const approvalColumns = [
    { key: "step_order", label: "Step" },
    { key: "step_name", label: "Name" },
    { key: "approver_role", label: "Role" },
    { key: "status", label: "Status", render: (r) => <Badge color={r.status === "APPROVED" ? "emerald" : r.status === "REJECTED" ? "red" : "amber"}>{r.status}</Badge> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-2">
        <button type="button" className="text-emerald-700 hover:text-emerald-800 text-xs" onClick={(e) => { e.stopPropagation(); runApprovalAction(r.id, "approve"); }}>Approve</button>
        <button type="button" className="text-red-700 hover:text-red-800 text-xs" onClick={(e) => { e.stopPropagation(); runApprovalAction(r.id, "reject"); }}>Reject</button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title={data.title} subtitle="Linked Document" backTo="/leases/documents" />

      <div className="space-y-6">
        {/* Document Details */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Document Details</h4>
            <Badge color={data.status === "VALID" || data.status === "EXECUTED" ? "emerald" : "amber"}>{data.status}</Badge>
            <Badge color="blue">{data.category}</Badge>
            <span className="text-xs text-gray-500">Version {data.version || "-"}</span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {[
              ["Agreement", data.agreement],
              ["Document Date", data.document_date],
              ["Expiry Date", data.expiry_date],
              ["Requires Renewal", data.requires_renewal ? "Yes" : "No"],
              ["Reminder Days", data.renewal_reminder_days],
              ["External URL", data.external_url],
            ].map(([label, value]) => (
              <div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd></div>
            ))}
          </dl>
          {data.description && <p className="mt-4 p-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-700">{data.description}</p>}
        </div>

        {/* Approval Workflow */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Approval Workflow</h4>
          </div>
          <DataTable columns={approvalColumns} data={approvals} loading={false} />
          <form onSubmit={createStep} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Step Order" icon={Hash} type="number" value={stepForm.step_order} onChange={(e) => setStepForm((p) => ({ ...p, step_order: e.target.value }))} />
            <Input label="Step Name" icon={FileText} value={stepForm.step_name} onChange={(e) => setStepForm((p) => ({ ...p, step_name: e.target.value }))} required />
            <Input label="Approver Role" icon={ClipboardCheck} value={stepForm.approver_role} onChange={(e) => setStepForm((p) => ({ ...p, approver_role: e.target.value }))} />
            <div className="flex items-end">
              <Button type="submit" size="sm" loading={savingStep}>Add Approval Step</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
