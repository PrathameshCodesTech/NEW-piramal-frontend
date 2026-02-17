import { CreditCard } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";

const PAYMENT_TERM_OPTIONS = [
  { value: "DUE_ON_RECEIPT", label: "Due on Receipt" },
  { value: "NET_7", label: "Net 7" },
  { value: "NET_15", label: "Net 15" },
  { value: "NET_30", label: "Net 30" },
  { value: "NET_45", label: "Net 45" },
  { value: "NET_60", label: "Net 60" },
];

export default function PaymentTermsSection({ form, setForm, readOnly, errors }) {
  const err = errors || {};
  const set = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [f]: v }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Payment Terms</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Default Payment Term"
          value={form.default_payment_term ?? ""}
          onChange={set("default_payment_term")}
          options={PAYMENT_TERM_OPTIONS}
          disabled={readOnly}
          error={err.default_payment_term}
        />
        <Input
          label="Grace Period (days)"
          type="number"
          min={0}
          value={form.grace_period_days ?? ""}
          onChange={set("grace_period_days")}
          readOnly={readOnly}
          error={err.grace_period_days}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Early Payment Discount %"
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={form.early_payment_discount_percent ?? ""}
          onChange={set("early_payment_discount_percent")}
          readOnly={readOnly}
          error={err.early_payment_discount_percent}
        />
        <Input
          label="Early Discount Days"
          type="number"
          min={0}
          value={form.early_payment_discount_days ?? ""}
          onChange={set("early_payment_discount_days")}
          readOnly={readOnly}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Late Fee %"
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={form.late_fee_percent ?? ""}
          onChange={set("late_fee_percent")}
          readOnly={readOnly}
        />
        <Input
          label="Late Fee Flat Amount"
          type="number"
          min={0}
          step={0.01}
          value={form.late_fee_flat_amount ?? ""}
          onChange={set("late_fee_flat_amount")}
          placeholder="Optional"
          readOnly={readOnly}
        />
      </div>
      <Input
        label="Interest Rate (annual %)"
        type="number"
        min={0}
        max={100}
        step={0.01}
        value={form.interest_rate_annual ?? ""}
        onChange={set("interest_rate_annual")}
        readOnly={readOnly}
      />
    </div>
  );
}
