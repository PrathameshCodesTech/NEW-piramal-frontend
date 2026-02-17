import { FileText } from "lucide-react";
import Select from "../../../../components/ui/Select";

export default function AgreementSection(props) {
  const { form, setForm, readOnly = false, agreements = [], errors = {} } = props;

  const set = (f) => (e) => {
    setForm((prev) => ({ ...prev, [f]: e.target.value }));
  };

  const options = agreements.map((a) => ({
    value: a.id,
    label: a.lease_id
      ? `${a.lease_id}${a.tenant_name ? ` - ${a.tenant_name}` : ""}`
      : `Agreement #${a.id}`,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-800">Agreement</h3>
      </div>
      <Select
        label="Agreement"
        value={form.agreement}
        onChange={set("agreement")}
        options={options}
        placeholder="Select agreement"
        disabled={readOnly}
        required
        error={errors.agreement}
      />
    </div>
  );
}
