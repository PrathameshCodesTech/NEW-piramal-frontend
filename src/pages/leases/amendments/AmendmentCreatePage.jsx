import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Hash, User, Calendar, Info } from "lucide-react";
import { agreementsAPI, leaseAmendmentsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const TYPE_OPTIONS = [
  { value: "RENT_REVISION", label: "Rent Revision" },
  { value: "AREA_CHANGE", label: "Area Change" },
  { value: "TERM_EXTENSION", label: "Term Extension" },
  { value: "RENEWAL", label: "Renewal" },
  { value: "EARLY_TERMINATION", label: "Early Termination" },
  { value: "PARTY_CHANGE", label: "Party Change" },
  { value: "CLAUSE_MODIFICATION", label: "Clause Modification" },
  { value: "ADDENDUM", label: "Addendum" },
  { value: "OTHER", label: "Other" },
];

const today = new Date().toISOString().slice(0, 10);

export default function AmendmentCreatePage() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    agreement: "", amendment_type: "OTHER", title: "",
    previous_version: "v1.0", new_version: "v1.1", is_major_version: false,
    amendment_date: today, effective_from: today, effective_to: "",
    changes_summary_text: "[]", description: "", reason: "", initiated_by: "",
  });

  useEffect(() => {
    agreementsAPI.list().then((r) => setAgreements(r?.results || r || [])).catch(() => setAgreements([]));
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: field === "is_major_version" ? e.target.checked : e.target.value }));

  const agreementOptions = agreements.map((a) => ({ value: String(a.id), label: a.lease_id || `Agreement ${a.id}` }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let changesSummary = [];
      if (form.changes_summary_text.trim()) {
        try { changesSummary = JSON.parse(form.changes_summary_text); }
        catch { toast.error("Changes Summary must be valid JSON array"); setLoading(false); return; }
      }
      const payload = {
        agreement: parseInt(form.agreement, 10), amendment_type: form.amendment_type,
        title: form.title, previous_version: form.previous_version,
        new_version: form.new_version, is_major_version: !!form.is_major_version,
        amendment_date: form.amendment_date, effective_from: form.effective_from,
        effective_to: form.effective_to || null, changes_summary: changesSummary,
        description: form.description, reason: form.reason, initiated_by: form.initiated_by,
      };
      const created = await leaseAmendmentsAPI.create(payload);
      toast.success("Amendment created");
      navigate(`/leases/amendments/${created.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Amendment" backTo="/leases/amendments" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amendment Details */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Amendment Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Agreement" value={form.agreement} onChange={set("agreement")} options={agreementOptions} required />
            <Select label="Amendment Type" value={form.amendment_type} onChange={set("amendment_type")} options={TYPE_OPTIONS} />
            <Input label="Title" icon={FileText} value={form.title} onChange={set("title")} />
            <Input label="Initiated By" icon={User} value={form.initiated_by} onChange={set("initiated_by")} />
            <Input label="Previous Version" icon={Hash} value={form.previous_version} onChange={set("previous_version")} />
            <Input label="New Version" icon={Hash} value={form.new_version} onChange={set("new_version")} />
          </div>
        </div>

        {/* Dates & Version */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Dates & Version</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Amendment Date" icon={Calendar} type="date" value={form.amendment_date} onChange={set("amendment_date")} required />
            <Input label="Effective From" icon={Calendar} type="date" value={form.effective_from} onChange={set("effective_from")} required />
            <Input label="Effective To" icon={Calendar} type="date" value={form.effective_to} onChange={set("effective_to")} />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_major_version} onChange={set("is_major_version")} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              Major version change
            </label>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Additional Information</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Changes Summary (JSON Array)</label>
              <textarea rows={4} value={form.changes_summary_text} onChange={set("changes_summary_text")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={set("description")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea rows={3} value={form.reason} onChange={set("reason")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/leases/amendments")}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Amendment</Button>
        </div>
      </form>
    </div>
  );
}
