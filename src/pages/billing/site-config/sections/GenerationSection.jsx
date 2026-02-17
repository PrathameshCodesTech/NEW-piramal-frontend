import { Zap } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";

const GENERATION_MODE_OPTIONS = [
  { value: "AUTO", label: "Auto" },
  { value: "MANUAL", label: "Manual" },
];

const GRANULARITY_OPTIONS = [
  { value: "PER_CHARGE_TYPE", label: "Per-charge-type Invoice" },
  { value: "CONSOLIDATED", label: "Consolidated tenant/month Invoice" },
];

export default function GenerationSection({ form, setForm, readOnly, errors }) {
  const err = errors || {};
  const set = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [f]: v }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Invoice Generation</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Generation Mode"
          value={form.generation_mode ?? ""}
          onChange={set("generation_mode")}
          options={GENERATION_MODE_OPTIONS}
          disabled={readOnly}
          error={err.generation_mode}
        />
        <Input
          label="Day of Month (1-28)"
          type="number"
          min={1}
          max={28}
          value={form.generation_day_of_month ?? ""}
          onChange={set("generation_day_of_month")}
          readOnly={readOnly}
          error={err.generation_day_of_month}
        />
      </div>
      <Input
        label="Relative Rule"
        value={form.relative_generation_rule ?? ""}
        onChange={set("relative_generation_rule")}
        placeholder="e.g. Day after due date"
        readOnly={readOnly}
        error={err.relative_generation_rule}
      />
      <Select
        label="Invoice Granularity"
        value={form.invoice_granularity ?? ""}
        onChange={set("invoice_granularity")}
        options={GRANULARITY_OPTIONS}
        disabled={readOnly}
        error={err.invoice_granularity}
      />
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!form.billing_address_override}
            onChange={set("billing_address_override")}
            disabled={readOnly}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Allow billing address override
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!form.default_gst_invoice_flag}
            onChange={set("default_gst_invoice_flag")}
            disabled={readOnly}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Default GST invoice flag
        </label>
      </div>
    </div>
  );
}
