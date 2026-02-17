import { Receipt } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";

const GST_SPLIT_OPTIONS = [
  { value: "IGST", label: "IGST" },
  { value: "CGST_SGST", label: "CGST+SGST" },
];

export default function TaxSection({ form, setForm, readOnly, errors = {} }) {
  const set = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [f]: v }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Tax Settings</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Default GST Rate %"
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={form.default_gst_rate ?? ""}
          onChange={set("default_gst_rate")}
          readOnly={readOnly}
          error={errors.default_gst_rate}
        />
        <Select
          label="GST Split Logic"
          value={form.gst_split_logic ?? ""}
          onChange={set("gst_split_logic")}
          options={GST_SPLIT_OPTIONS}
          disabled={readOnly}
          error={errors.gst_split_logic}
        />
      </div>
      {!readOnly && (
        <p className="text-xs text-gray-500">
          State tax rules can be configured via API for advanced splitting.
        </p>
      )}
    </div>
  );
}
