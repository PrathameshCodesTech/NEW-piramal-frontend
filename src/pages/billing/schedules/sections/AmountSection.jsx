import { DollarSign } from "lucide-react";
import Input from "../../../../components/ui/Input";

export default function AmountSection(props) {
  const { form, setForm, readOnly = false, errors = {} } = props;

  const set = (f) => (e) => {
    setForm((prev) => ({ ...prev, [f]: e.target.value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Amount and Tax</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          min={0}
          step="0.01"
          value={form.amount ?? ""}
          onChange={set("amount")}
          placeholder="0.00"
          readOnly={readOnly}
          required
          error={errors.amount}
        />
        <Input
          label="Tax Rate (%)"
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={form.tax_rate ?? ""}
          onChange={set("tax_rate")}
          placeholder="18.00"
          readOnly={readOnly}
          error={errors.tax_rate}
        />
      </div>
    </div>
  );
}
