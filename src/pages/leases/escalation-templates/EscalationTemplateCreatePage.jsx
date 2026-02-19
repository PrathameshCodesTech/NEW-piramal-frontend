import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { TrendingUp, Percent, Calendar, Info } from "lucide-react";
import { escalationTemplatesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const TYPE_OPTIONS = [
  { value: "FIXED_PERCENT", label: "Fixed %" },
  { value: "INDEX_LINKED", label: "Index Linked" },
  { value: "STEP_WISE", label: "Step Wise" },
];

const FREQUENCY_OPTIONS = [
  { value: "ANNUAL", label: "Annual" },
  { value: "EVERY_2_YEARS", label: "Every 2 Years" },
  { value: "EVERY_3_YEARS", label: "Every 3 Years" },
  { value: "EVERY_5_YEARS", label: "Every 5 Years" },
];

const APPLICABILITY_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "COMMERCIAL_OFFICE", label: "Commercial Office" },
  { value: "RESIDENTIAL_APARTMENTS", label: "Residential Apartments" },
  { value: "RETAIL_SHOPPING_MALL", label: "Retail Shopping Mall" },
  { value: "INDUSTRIAL_WAREHOUSE", label: "Industrial Warehouse" },
  { value: "MIXED_USE", label: "Mixed Use" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
];

const ROUNDING_OPTIONS = [
  { value: "NEAREST_DOLLAR", label: "Nearest Dollar" },
  { value: "NEAREST_UNIT", label: "Nearest Unit" },
  { value: "NEAREST_TEN", label: "Nearest Ten" },
  { value: "NEAREST_HUNDRED", label: "Nearest Hundred" },
  { value: "NO_ROUNDING", label: "No Rounding" },
];

export default function EscalationTemplateCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    escalation_type: "FIXED_PERCENT",
    frequency: "ANNUAL",
    escalation_percentage: "",
    first_escalation_months: "12",
    index_name: "",
    index_base_value: "",
    step_schedule_text: "",
    rounding_rule: "NEAREST_DOLLAR",
    applicability: "ALL",
    status: "DRAFT",
    cap_percentage: "",
    floor_percentage: "",
    apply_to_cam: false,
    apply_to_parking: false,
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setChecked = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.checked }));

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstEscalationMonths = toNumberOrNull(form.first_escalation_months) || 12;
    const escalationPercentage = toNumberOrNull(form.escalation_percentage);
    const indexBaseValue = toNumberOrNull(form.index_base_value);
    let stepSchedule = [];

    if (form.escalation_type === "FIXED_PERCENT" && escalationPercentage === null) {
      toast.error("Escalation % is required for Fixed % templates");
      return;
    }
    if (form.escalation_type === "INDEX_LINKED") {
      if (!form.index_name.trim()) {
        toast.error("Index Name is required for Index Linked templates");
        return;
      }
      if (indexBaseValue === null) {
        toast.error("Index Base Value is required for Index Linked templates");
        return;
      }
    }
    if (form.escalation_type === "STEP_WISE") {
      if (!form.step_schedule_text.trim()) {
        toast.error("Step schedule JSON is required for Step Wise templates");
        return;
      }
      try {
        stepSchedule = JSON.parse(form.step_schedule_text);
      } catch {
        toast.error("Invalid JSON in Step Schedule");
        return;
      }
      if (!Array.isArray(stepSchedule) || stepSchedule.length === 0) {
        toast.error("Step Schedule must be a non-empty JSON array");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        escalation_type: form.escalation_type,
        frequency: form.frequency,
        escalation_percentage: form.escalation_type === "FIXED_PERCENT" ? escalationPercentage : null,
        first_escalation_months: firstEscalationMonths,
        first_escalation_logic: `After ${firstEscalationMonths} months from rent start`,
        index_name: form.escalation_type === "INDEX_LINKED" ? form.index_name.trim() : "",
        index_base_value: form.escalation_type === "INDEX_LINKED" ? indexBaseValue : null,
        step_schedule: form.escalation_type === "STEP_WISE" ? stepSchedule : [],
        rounding_rule: form.rounding_rule,
        applicability: form.applicability,
        status: form.status,
        cap_percentage: toNumberOrNull(form.cap_percentage),
        floor_percentage: toNumberOrNull(form.floor_percentage),
        apply_to_cam: !!form.apply_to_cam,
        apply_to_parking: !!form.apply_to_parking,
      };
      const created = await escalationTemplatesAPI.create(payload);
      toast.success("Template created");
      navigate(`/leases/escalation-templates/${created.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Escalation Template" backTo="/leases/escalation-templates" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Details */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Template Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Name" icon={TrendingUp} value={form.name} onChange={set("name")} required />
            <Select label="Escalation Type" value={form.escalation_type} onChange={set("escalation_type")} options={TYPE_OPTIONS} />
            <Select label="Frequency" value={form.frequency} onChange={set("frequency")} options={FREQUENCY_OPTIONS} />
            {form.escalation_type === "FIXED_PERCENT" && (
              <Input label="Escalation %" icon={Percent} type="number" step="0.01" value={form.escalation_percentage} onChange={set("escalation_percentage")} />
            )}
            {form.escalation_type === "INDEX_LINKED" && (
              <>
                <Input label="Index Name" value={form.index_name} onChange={set("index_name")} />
                <Input label="Index Base Value" type="number" step="0.01" value={form.index_base_value} onChange={set("index_base_value")} />
              </>
            )}
            <Input label="First Escalation (Months)" icon={Calendar} type="number" value={form.first_escalation_months} onChange={set("first_escalation_months")} />
            <Select label="Rounding Rule" value={form.rounding_rule} onChange={set("rounding_rule")} options={ROUNDING_OPTIONS} />
            <Select label="Applicability" value={form.applicability} onChange={set("applicability")} options={APPLICABILITY_OPTIONS} />
            <Input label="Cap %" icon={Percent} type="number" step="0.01" value={form.cap_percentage} onChange={set("cap_percentage")} />
            <Input label="Floor %" icon={Percent} type="number" step="0.01" value={form.floor_percentage} onChange={set("floor_percentage")} />
            <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.apply_to_cam}
                onChange={setChecked("apply_to_cam")}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Apply to CAM
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.apply_to_parking}
                onChange={setChecked("apply_to_parking")}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Apply to Parking
            </label>
          </div>
          {form.escalation_type === "STEP_WISE" && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Step Schedule (JSON)
              </label>
              <textarea
                rows={5}
                value={form.step_schedule_text}
                onChange={set("step_schedule_text")}
                placeholder={'[\n  { "year": 1, "percentage": 0 },\n  { "year": 2, "percentage": 5 }\n]'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Description</h4>
          </div>
          <textarea
            rows={4}
            value={form.description}
            onChange={set("description")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/leases/escalation-templates")}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Template</Button>
        </div>
      </form>
    </div>
  );
}
