import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { TrendingUp, Hash, Percent, Calendar, Info } from "lucide-react";
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
    applicability: "ALL",
    status: "DRAFT",
    cap_percentage: "",
    floor_percentage: "",
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        escalation_percentage: toNumberOrNull(form.escalation_percentage),
        first_escalation_months: toNumberOrNull(form.first_escalation_months) || 12,
        cap_percentage: toNumberOrNull(form.cap_percentage),
        floor_percentage: toNumberOrNull(form.floor_percentage),
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
            <Input label="Escalation %" icon={Percent} type="number" step="0.01" value={form.escalation_percentage} onChange={set("escalation_percentage")} />
            <Input label="First Escalation (Months)" icon={Calendar} type="number" value={form.first_escalation_months} onChange={set("first_escalation_months")} />
            <Select label="Applicability" value={form.applicability} onChange={set("applicability")} options={APPLICABILITY_OPTIONS} />
            <Input label="Cap %" icon={Percent} type="number" step="0.01" value={form.cap_percentage} onChange={set("cap_percentage")} />
            <Input label="Floor %" icon={Percent} type="number" step="0.01" value={form.floor_percentage} onChange={set("floor_percentage")} />
            <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
          </div>
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
