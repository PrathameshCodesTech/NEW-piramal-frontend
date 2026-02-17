import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { disputeRulesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

const CONDITION_TYPE_OPTIONS = [
  { value: "INVOICE_AMOUNT", label: "Invoice Amount" },
  { value: "DISPUTE_COUNT", label: "Dispute Count" },
  { value: "CUSTOMER_TYPE", label: "Customer Type" },
  { value: "INVOICE_AGE", label: "Invoice Age (Days)" },
  { value: "DISPUTE_AMOUNT", label: "Dispute Amount" },
];
const OPERATOR_OPTIONS = [
  { value: "GT", label: "> (Greater Than)" },
  { value: "LT", label: "< (Less Than)" },
  { value: "EQ", label: "= (Equal)" },
  { value: "GTE", label: ">= (Greater or Equal)" },
  { value: "LTE", label: "<= (Less or Equal)" },
  { value: "NE", label: "!= (Not Equal)" },
];
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function DisputeRuleCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    condition_type: "INVOICE_AMOUNT",
    operator: "GT",
    threshold_value: "",
    threshold_currency: "INR",
    time_window_days: "",
    action_description: "",
    route_to_role: "",
    status: "ACTIVE",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        condition_type: form.condition_type,
        operator: form.operator,
        threshold_value: parseFloat(form.threshold_value) || 0,
        threshold_currency: form.threshold_currency,
        action_description: form.action_description,
        route_to_role: form.route_to_role || undefined,
        status: form.status,
      };
      if (form.time_window_days) payload.time_window_days = parseInt(form.time_window_days, 10);
      const res = await disputeRulesAPI.create(payload);
      toast.success("Dispute rule created");
      navigate(`/billing/dispute-rules/${res.id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create dispute rule");
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) =>
    setForm((p) => ({ ...p, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const formContent = (
    <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-xl"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={form.name} onChange={set("name")} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={set("description")} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <Select label="Condition Type" value={form.condition_type} onChange={set("condition_type")} options={CONDITION_TYPE_OPTIONS} />
        <Select label="Operator" value={form.operator} onChange={set("operator")} options={OPERATOR_OPTIONS} />
        <Input label="Threshold Value" type="number" step="0.01" value={form.threshold_value} onChange={set("threshold_value")} required />
        <Input label="Currency" value={form.threshold_currency} onChange={set("threshold_currency")} />
        <Input label="Time Window (days, optional)" type="number" value={form.time_window_days} onChange={set("time_window_days")} placeholder="e.g. 30" />
        <Input label="Action Description" value={form.action_description} onChange={set("action_description")} placeholder="e.g. Auto route to Finance Manager" required />
        <Input label="Route To Role (optional)" value={form.route_to_role} onChange={set("route_to_role")} placeholder="e.g. AR Manager, Finance Manager" />
        <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/billing/dispute-rules")}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </form>
    </Card>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Create Dispute Rule" backTo="/billing/dispute-rules" />
      {formContent}
    </div>
  );
}
