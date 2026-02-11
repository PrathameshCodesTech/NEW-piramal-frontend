import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Hash, Link, Calendar, Info, Bell } from "lucide-react";
import { agreementsAPI, leaseLinkedDocumentsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const CATEGORY_OPTIONS = [
  { value: "LEGAL", label: "Legal" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "FINANCIAL", label: "Financial" },
  { value: "CORRESPONDENCE", label: "Correspondence" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "PERMITS", label: "Permits" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "PENDING_SIGNATURE", label: "Pending Signature" },
  { value: "EXECUTED", label: "Executed" },
  { value: "VALID", label: "Valid" },
];

export default function LeaseDocumentCreatePage() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    agreement: "", title: "", category: "OTHER", status: "DRAFT",
    external_url: "", version: "v1.0", document_date: "",
    effective_date: "", expiry_date: "", requires_renewal: false,
    renewal_reminder_days: "30", description: "", notes: "", file: null,
  });

  useEffect(() => {
    agreementsAPI.list().then((r) => setAgreements(r?.results || r || [])).catch(() => setAgreements([]));
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: field === "requires_renewal" ? e.target.checked : e.target.value }));

  const agreementOptions = agreements.map((a) => ({ value: String(a.id), label: a.lease_id || `Agreement ${a.id}` }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("agreement", form.agreement);
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("status", form.status);
      if (form.external_url) fd.append("external_url", form.external_url);
      if (form.version) fd.append("version", form.version);
      if (form.document_date) fd.append("document_date", form.document_date);
      if (form.effective_date) fd.append("effective_date", form.effective_date);
      if (form.expiry_date) fd.append("expiry_date", form.expiry_date);
      fd.append("requires_renewal", form.requires_renewal ? "true" : "false");
      fd.append("renewal_reminder_days", String(Number(form.renewal_reminder_days || 30)));
      if (form.description) fd.append("description", form.description);
      if (form.notes) fd.append("notes", form.notes);
      if (form.file) fd.append("file", form.file);
      const created = await leaseLinkedDocumentsAPI.upload(fd);
      toast.success("Linked document created");
      navigate(`/leases/documents/${created.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Linked Document" backTo="/leases/documents" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Info */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Document Info</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Agreement" value={form.agreement} onChange={set("agreement")} options={agreementOptions} required />
            <Input label="Title" icon={FileText} value={form.title} onChange={set("title")} required />
            <Select label="Category" value={form.category} onChange={set("category")} options={CATEGORY_OPTIONS} />
            <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
            <Input label="Version" icon={Hash} value={form.version} onChange={set("version")} />
            <Input label="External URL" icon={Link} value={form.external_url} onChange={set("external_url")} />
          </div>
        </div>

        {/* Dates & Renewal */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Dates & Renewal</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Document Date" icon={Calendar} type="date" value={form.document_date} onChange={set("document_date")} />
            <Input label="Effective Date" icon={Calendar} type="date" value={form.effective_date} onChange={set("effective_date")} />
            <Input label="Expiry Date" icon={Calendar} type="date" value={form.expiry_date} onChange={set("expiry_date")} />
            <Input label="Renewal Reminder Days" icon={Bell} type="number" value={form.renewal_reminder_days} onChange={set("renewal_reminder_days")} />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.requires_renewal} onChange={set("requires_renewal")} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              Requires renewal
            </label>
          </div>
        </div>

        {/* Additional */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Additional</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={set("description")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={3} value={form.notes} onChange={set("notes")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File (optional)</label>
              <input type="file" onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/leases/documents")}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Document</Button>
        </div>
      </form>
    </div>
  );
}
