import { Calendar } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";

const INVOICE_TYPE_OPTIONS = [
  { value: "RENT", label: "Rent" },
  { value: "CAM", label: "CAM" },
  { value: "DEPOSIT", label: "Security Deposit" },
  { value: "UTILITY", label: "Utility" },
  { value: "LATE_FEE", label: "Late Fee" },
  { value: "INTEREST", label: "Interest" },
];

const FREQUENCY_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALF_YEARLY", label: "Half Yearly" },
  { value: "ANNUALLY", label: "Annually" },
  { value: "ONE_TIME", label: "One Time" },
];

export default function BasicInfoSection(props) {
  const { form, setForm, readOnly = false, errors = {} } = props;

  const set = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [f]: v }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Basic Info</h3>
      </div>
      <Input
        label="Schedule Name"
        value={form.schedule_name ?? ""}
        onChange={set("schedule_name")}
        placeholder="e.g. Monthly Rent"
        readOnly={readOnly}
        required
        error={errors.schedule_name}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Invoice Type"
          value={form.invoice_type ?? ""}
          onChange={set("invoice_type")}
          options={INVOICE_TYPE_OPTIONS}
          placeholder="Select type"
          disabled={readOnly}
          required
          error={errors.invoice_type}
        />
        <Select
          label="Frequency"
          value={form.frequency ?? ""}
          onChange={set("frequency")}
          options={FREQUENCY_OPTIONS}
          placeholder="Select frequency"
          disabled={readOnly}
          required
          error={errors.frequency}
        />
      </div>
    </div>
  );
}
