import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Hash, GitBranch, ClipboardCheck, Paperclip, Info } from "lucide-react";
import {
  amendmentApprovalsAPI, amendmentAttachmentsAPI,
  agreementsAPI, leaseAmendmentsAPI,
} from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const ATTACHMENT_TYPE_OPTIONS = [
  { value: "AMENDMENT_AGREEMENT", label: "Amendment Agreement" },
  { value: "SIGNED_ADDENDUM", label: "Signed Addendum" },
  { value: "SUPPORTING_DOC", label: "Supporting Document" },
  { value: "APPROVAL_DOC", label: "Approval Document" },
  { value: "CORRESPONDENCE", label: "Correspondence" },
  { value: "OTHER", label: "Other" },
];

const statusColor = (status) => {
  if (status === "APPROVED" || status === "EXECUTED") return "emerald";
  if (status === "REJECTED") return "red";
  if (status === "DRAFT") return "blue";
  return "amber";
};

export default function AmendmentViewPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [agreementSnapshot, setAgreementSnapshot] = useState(null);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [approvalStepForm, setApprovalStepForm] = useState({ step_order: "1", step_name: "", approver_role: "", due_date: "" });
  const [attachmentForm, setAttachmentForm] = useState({ title: "", attachment_type: "OTHER", description: "", file: null });

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await leaseAmendmentsAPI.get(id);
      setData(res);
      const linkedAgreementId = (typeof res?.agreement === "number" && res.agreement) || (typeof res?.agreement === "string" && Number(res.agreement)) || res?.agreement_details?.id || null;
      if (linkedAgreementId) {
        setAgreementLoading(true);
        agreementsAPI.get(linkedAgreementId).then((a) => setAgreementSnapshot(a)).catch(() => setAgreementSnapshot(null)).finally(() => setAgreementLoading(false));
      } else { setAgreementLoading(false); setAgreementSnapshot(null); }
    } catch { setData(null); setAgreementLoading(false); setAgreementSnapshot(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const runAction = async (fn, label) => {
    setActionLoading(true);
    try { await fn(id); toast.success(label); await fetchDetail(); }
    catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleApprovalAction = async (approvalId, action) => {
    try { await amendmentApprovalsAPI.action(approvalId, { action }); toast.success(`Approval ${action}`); await fetchDetail(); }
    catch (err) { toast.error(err.message); }
  };

  const createStep = async (e) => {
    e.preventDefault(); setSavingStep(true);
    try {
      await amendmentApprovalsAPI.create({ amendment: parseInt(id, 10), step_order: Number(approvalStepForm.step_order || 1), step_name: approvalStepForm.step_name, approver_role: approvalStepForm.approver_role, due_date: approvalStepForm.due_date || null });
      toast.success("Approval step added");
      setApprovalStepForm({ step_order: "1", step_name: "", approver_role: "", due_date: "" });
      await fetchDetail();
    } catch (err) { toast.error(err.message); }
    finally { setSavingStep(false); }
  };

  const uploadAttachment = async (e) => {
    e.preventDefault();
    if (!attachmentForm.file) { toast.error("Please select a file"); return; }
    setUploadingAttachment(true);
    try {
      const fd = new FormData();
      fd.append("amendment", id); fd.append("title", attachmentForm.title);
      fd.append("attachment_type", attachmentForm.attachment_type);
      fd.append("description", attachmentForm.description); fd.append("file", attachmentForm.file);
      await amendmentAttachmentsAPI.upload(fd);
      toast.success("Attachment uploaded");
      setAttachmentForm({ title: "", attachment_type: "OTHER", description: "", file: null });
      await fetchDetail();
    } catch (err) { toast.error(err.message); }
    finally { setUploadingAttachment(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Amendment not found.</div>;

  const approvalColumns = [
    { key: "step_order", label: "Step" },
    { key: "step_name", label: "Name" },
    { key: "approver_role", label: "Role" },
    { key: "status", label: "Status", render: (r) => <Badge color={r.status === "APPROVED" ? "emerald" : r.status === "REJECTED" ? "red" : "amber"}>{r.status}</Badge> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-2">
        <button type="button" className="text-emerald-700 hover:text-emerald-800 text-xs" onClick={(e) => { e.stopPropagation(); handleApprovalAction(r.id, "approve"); }}>Approve</button>
        <button type="button" className="text-red-700 hover:text-red-800 text-xs" onClick={(e) => { e.stopPropagation(); handleApprovalAction(r.id, "reject"); }}>Reject</button>
      </div>
    )},
  ];

  const attachmentColumns = [
    { key: "title", label: "Title" },
    { key: "attachment_type", label: "Type" },
    { key: "file_size", label: "Size", render: (r) => (r.file_size ? `${(r.file_size / 1024).toFixed(1)} KB` : "-") },
    { key: "created_at", label: "Uploaded", render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "-") },
  ];

  return (
    <div>
      <PageHeader
        title={data.amendment_id || data.title || `Amendment ${id}`}
        subtitle={data.agreement_lease_id || "Amendment"}
        backTo="/leases/amendments"
        actions={
          <div className="flex gap-2">
            {data.approval_status === "DRAFT" && <Button size="sm" loading={actionLoading} onClick={() => runAction(leaseAmendmentsAPI.submit, "Submitted")}>Submit</Button>}
            {(data.approval_status === "PENDING_REVIEW" || data.approval_status === "PENDING_APPROVAL") && (
              <>
                <Button size="sm" loading={actionLoading} onClick={() => runAction(leaseAmendmentsAPI.approve, "Approved")}>Approve</Button>
                <Button size="sm" variant="danger" loading={actionLoading} onClick={() => runAction(leaseAmendmentsAPI.reject, "Rejected")}>Reject</Button>
              </>
            )}
            {data.approval_status === "APPROVED" && <Button size="sm" loading={actionLoading} onClick={() => runAction(leaseAmendmentsAPI.execute, "Executed")}>Execute</Button>}
          </div>
        }
      />

      <div className="space-y-6">
        {/* Amendment Details */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Amendment Details</h4>
            <Badge color={statusColor(data.approval_status)}>{data.approval_status}</Badge>
            <Badge color="blue">{data.amendment_type}</Badge>
            <span className="text-xs text-gray-500">{data.previous_version} → {data.new_version}</span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {[
              ["Title", data.title], ["Amendment Date", data.amendment_date],
              ["Effective From", data.effective_from], ["Effective To", data.effective_to],
              ["Initiated By", data.initiated_by],
            ].map(([label, value]) => (
              <div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd></div>
            ))}
          </dl>
          {data.description && <p className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">{data.description}</p>}
        </div>

        {/* Version Bump */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Version Bump Visibility</h4>
          </div>
          {agreementLoading ? (
            <div className="flex justify-center py-3"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              <div><dt className="text-xs font-medium text-gray-500">Amendment Target Version</dt><dd className="text-sm text-gray-800 mt-0.5">{data.new_version || "—"}</dd></div>
              <div><dt className="text-xs font-medium text-gray-500">Current Agreement Version</dt><dd className="text-sm text-gray-800 mt-0.5">{agreementSnapshot ? `v${agreementSnapshot.version_number || 1}` : "—"}</dd></div>
              <div><dt className="text-xs font-medium text-gray-500">Bump State</dt><dd className="text-sm mt-0.5">{data.approval_status === "EXECUTED" ? <Badge color="emerald">Applied (Executed)</Badge> : <Badge color="amber">Pending Execute</Badge>}</dd></div>
            </dl>
          )}
        </div>

        {/* Approval Workflow */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Approval Workflow</h4>
          </div>
          <DataTable columns={approvalColumns} data={data.approvals || []} loading={false} />
          <form onSubmit={createStep} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Step Order" icon={Hash} type="number" value={approvalStepForm.step_order} onChange={(e) => setApprovalStepForm((p) => ({ ...p, step_order: e.target.value }))} />
            <Input label="Step Name" icon={FileText} value={approvalStepForm.step_name} onChange={(e) => setApprovalStepForm((p) => ({ ...p, step_name: e.target.value }))} required />
            <Input label="Approver Role" icon={ClipboardCheck} value={approvalStepForm.approver_role} onChange={(e) => setApprovalStepForm((p) => ({ ...p, approver_role: e.target.value }))} />
            <Input label="Due Date" type="date" value={approvalStepForm.due_date} onChange={(e) => setApprovalStepForm((p) => ({ ...p, due_date: e.target.value }))} />
            <div className="lg:col-span-4 flex justify-end">
              <Button type="submit" size="sm" loading={savingStep}>Add Approval Step</Button>
            </div>
          </form>
        </div>

        {/* Attachments */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Paperclip className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Attachments</h4>
          </div>
          <DataTable columns={attachmentColumns} data={data.attachments || []} loading={false} />
          <form onSubmit={uploadAttachment} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Title" icon={FileText} value={attachmentForm.title} onChange={(e) => setAttachmentForm((p) => ({ ...p, title: e.target.value }))} required />
            <Select label="Attachment Type" value={attachmentForm.attachment_type} onChange={(e) => setAttachmentForm((p) => ({ ...p, attachment_type: e.target.value }))} options={ATTACHMENT_TYPE_OPTIONS} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <input type="file" onChange={(e) => setAttachmentForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={attachmentForm.description} onChange={(e) => setAttachmentForm((p) => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <Button type="submit" size="sm" loading={uploadingAttachment}>Upload Attachment</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
