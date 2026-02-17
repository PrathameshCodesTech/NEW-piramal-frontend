import { Hash } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";

const COUNTER_RESET_OPTIONS = [
  { value: "NEVER", label: "Never" },
  { value: "YEARLY", label: "Yearly" },
  { value: "MONTHLY", label: "Monthly" },
];

export default function NumberingSection(props) {
  const { form, setForm, readOnly = false, errors = {} } = props;

  const set = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [f]: v }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Numbering and Counters</h3>
      </div>
      <Input
        label="Invoice Pattern"
        value={form.invoice_pattern ?? ""}
        onChange={set("invoice_pattern")}
        placeholder="INV/PROP/YEAR/COUNTER"
        readOnly={readOnly}
        error={errors.invoice_pattern}
      />
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!form.include_property_code}
            onChange={set("include_property_code")}
            disabled={readOnly}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Include property code
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!form.include_year_token}
            onChange={set("include_year_token")}
            disabled={readOnly}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Include year
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Counter Reset"
          value={form.counter_reset_frequency ?? ""}
          onChange={set("counter_reset_frequency")}
          options={COUNTER_RESET_OPTIONS}
          placeholder="When to reset"
          disabled={readOnly}
          error={errors.counter_reset_frequency}
        />
        <Input
          label="Counter Padding"
          type="number"
          min={1}
          max={8}
          value={form.counter_padding ?? ""}
          onChange={set("counter_padding")}
          readOnly={readOnly}
          error={errors.counter_padding}
        />
      </div>
    </div>
  );
}
