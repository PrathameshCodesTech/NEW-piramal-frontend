import { BookOpen } from "lucide-react";
import Input from "../../../../components/ui/Input";

export default function LedgerSection({ form, setForm, readOnly, errors = {} }) {
  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const fields = [
    { key: "revenue_gl", label: "Revenue GL", placeholder: "e.g. 4000-RENT-REV" },
    { key: "gst_output_gl", label: "GST Output GL", placeholder: "e.g. 2100-GST-OUT" },
    { key: "gst_input_gl", label: "GST Input GL", placeholder: "e.g. 2100-GST-IN" },
    { key: "receivables_gl", label: "Receivables GL", placeholder: "e.g. 1200-AR" },
    { key: "late_fee_gl", label: "Late Fee GL" },
    { key: "interest_gl", label: "Interest Income GL" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Ledger Mapping</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, placeholder }) => (
          <Input
            key={key}
            label={label}
            value={form[key] ?? ""}
            onChange={set(key)}
            placeholder={placeholder}
            readOnly={readOnly}
            error={errors[key]}
          />
        ))}
      </div>
    </div>
  );
}
