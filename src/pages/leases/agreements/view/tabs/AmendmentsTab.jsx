import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FilePen, Plus, X, Calendar, FileText, Info, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { leaseAmendmentsAPI } from "../../../../../services/api";
import Button from "../../../../../components/ui/Button";
import Badge from "../../../../../components/ui/Badge";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";

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

const STATUS_COLOR = {
  PENDING: "amber",
  APPROVED: "emerald",
  REJECTED: "red",
  DRAFT: "gray",
  EXECUTED: "blue",
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  amendment_type: "OTHER",
  title: "",
  previous_version: "v1.0",
  new_version: "v1.1",
  is_major_version: false,
  amendment_date: today,
  effective_from: today,
  effective_to: "",
  description: "",
  reason: "",
  initiated_by: "",
};

export default function AmendmentsTab({ agreementId }) {
  const navigate = useNavigate();
  const [amendments, setAmendments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAmendments = useCallback(() => {
    if (!agreementId) return;
    setLoading(true);
    leaseAmendmentsAPI
      .list({ agreement: agreementId })
      .then((r) => setAmendments(r?.results || r || []))
      .catch(() => setAmendments([]))
      .finally(() => setLoading(false));
  }, [agreementId]);

  useEffect(() => { fetchAmendments(); }, [fetchAmendments]);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: field === "is_major_version" ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        agreement: parseInt(agreementId, 10),
        amendment_type: form.amendment_type,
        title: form.title,
        previous_version: form.previous_version,
        new_version: form.new_version,
        is_major_version: !!form.is_major_version,
        amendment_date: form.amendment_date,
        effective_from: form.effective_from,
        effective_to: form.effective_to || null,
        changes_summary: [],
        description: form.description,
        reason: form.reason,
        initiated_by: form.initiated_by,
      };
      const created = await leaseAmendmentsAPI.create(payload);
      toast.success("Amendment created");
      setShowForm(false);
      setForm(emptyForm);
      fetchAmendments();
      navigate(`/leases/amendments/${created.id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create amendment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilePen className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Amendments</h4>
          {amendments.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{amendments.length}</span>
          )}
        </div>
        {!showForm && (
          <Button
            icon={Plus}
            onClick={() => setShowForm(true)}
            className="text-sm"
          >
            Add Amendment
          </Button>
        )}
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="border border-emerald-200 rounded-xl bg-emerald-50/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <h5 className="text-sm font-semibold text-gray-700">New Amendment</h5>
            </div>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                label="Amendment Type"
                value={form.amendment_type}
                onChange={set("amendment_type")}
                options={TYPE_OPTIONS}
              />
              <Input
                label="Title *"
                icon={FileText}
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Rent revision FY2025"
                required
              />
              <Input
                label="Initiated By"
                value={form.initiated_by}
                onChange={set("initiated_by")}
                placeholder="Name or role"
              />
            </div>

            {/* Row 2 — Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Amendment Date" type="date" icon={Calendar} value={form.amendment_date} onChange={set("amendment_date")} required />
              <Input label="Effective From" type="date" icon={Calendar} value={form.effective_from} onChange={set("effective_from")} required />
              <Input label="Effective To" type="date" icon={Calendar} value={form.effective_to} onChange={set("effective_to")} />
            </div>

            {/* Row 3 — Versions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input label="Previous Version" value={form.previous_version} onChange={set("previous_version")} />
              <Input label="New Version" value={form.new_version} onChange={set("new_version")} />
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_major_version}
                    onChange={set("is_major_version")}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Major version
                </label>
              </div>
            </div>

            {/* Reason & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                <textarea
                  rows={2}
                  value={form.reason}
                  onChange={set("reason")}
                  placeholder="Why is this amendment needed?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Details of the changes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}>
                Cancel
              </Button>
              <Button type="submit" loading={saving} icon={Plus}>
                Create Amendment
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Amendments list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : amendments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
          <FilePen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No amendments yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Amendment" to record a change to this lease.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {amendments.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/leases/amendments/${a.id}`)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-4 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{a.title || `Amendment ${a.amendment_id}`}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {a.amendment_type?.replace(/_/g, " ")} · {a.amendment_id} · Effective {a.effective_from || "—"}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">{a.amendment_date}</p>
                  <p className="text-xs text-gray-400">{a.previous_version} → {a.new_version}</p>
                </div>
                <Badge color={STATUS_COLOR[a.approval_status] || "gray"}>
                  {a.approval_status || "DRAFT"}
                </Badge>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
