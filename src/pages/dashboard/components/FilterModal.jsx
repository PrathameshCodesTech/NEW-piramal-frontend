import { Loader2 } from "lucide-react";
import Modal from "../ui/Modal";

const cn = (...a) => a.filter(Boolean).join(" ");

function Button({ children, variant = "primary", className, ...props }) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-colors px-4 py-2 text-sm gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export default function FilterModal({ open, onClose, draft, setDraft, filterOptions, onApply, loading }) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Filters" subtitle="Filter dashboard data">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sites</label>
          <select
            multiple
            value={draft.site_ids || []}
            onChange={(e) => setDraft({ ...draft, site_ids: Array.from(e.target.selectedOptions, (o) => o.value) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {(filterOptions?.sites || []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={draft.date_from || ""}
              onChange={(e) => setDraft({ ...draft, date_from: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={draft.date_to || ""}
              onChange={(e) => setDraft({ ...draft, date_to: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
          <input
            type="date"
            value={draft.as_of || ""}
            onChange={(e) => setDraft({ ...draft, as_of: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onApply} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Filters"}
        </Button>
      </div>
    </Modal>
  );
}
