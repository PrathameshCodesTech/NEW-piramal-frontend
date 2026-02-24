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

const Chk = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" checked={checked} onChange={onChange} className="rounded" />
    {label}
  </label>
);

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
    route_to_user: "",
    auto_resolve: false,
    auto_resolve_action: "",
    require_approval: false,
    flag_customer: false,
    priority: "",
    status: "ACTIVE",
    trigger_mode: "MANUAL",
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
        route_to_user: form.route_to_user || undefined,
        auto_resolve: form.auto_resolve,
        auto_resolve_action: form.auto_resolve_action || undefined,
        require_approval: form.require_approval,
        flag_customer: form.flag_customer,
        status: form.status,
        trigger_mode: form.trigger_mode,
      };
      if (form.time_window_days) payload.time_window_days = parseInt(form.time_window_days, 10);
      if (form.priority) payload.priority = parseInt(form.priority, 10);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-xl"}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={set("name")} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Trigger Condition</p>
            <div className="space-y-3">
              <Select label="Condition Type" value={form.condition_type} onChange={set("condition_type")} options={CONDITION_TYPE_OPTIONS} />
              <Select label="Operator" value={form.operator} onChange={set("operator")} options={OPERATOR_OPTIONS} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Threshold Value" type="number" step="0.01" value={form.threshold_value} onChange={set("threshold_value")} required />
                <Input label="Currency" value={form.threshold_currency} onChange={set("threshold_currency")} />
              </div>
              <Input label="Time Window (days, optional)" type="number" value={form.time_window_days} onChange={set("time_window_days")} placeholder="e.g. 30" />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Action & Routing</p>
            <div className="space-y-3">
              <Input label="Action Description" value={form.action_description} onChange={set("action_description")} placeholder="e.g. Auto route to Finance Manager" required />
              <Input label="Route to Role (optional)" value={form.route_to_role} onChange={set("route_to_role")} placeholder="e.g. AR Manager" />
              <Input label="Route to User (optional)" value={form.route_to_user} onChange={set("route_to_user")} placeholder="User ID or username" />
              <Input label="Priority (lower = higher priority)" type="number" min={1} value={form.priority} onChange={set("priority")} placeholder="e.g. 1" />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Behaviour</p>
            <div className="space-y-2">
              <Chk label="Require approval before resolution" checked={form.require_approval} onChange={set("require_approval")} />
              <Chk label="Flag customer account" checked={form.flag_customer} onChange={set("flag_customer")} />
              <Chk label="Auto-resolve when condition clears" checked={form.auto_resolve} onChange={set("auto_resolve")} />
              {form.auto_resolve && (
                <Input label="Auto-resolve action" value={form.auto_resolve_action} onChange={set("auto_resolve_action")} placeholder="e.g. send_resolution_email" />
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
          </div>
          <div className="border-t pt-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Trigger Mode</p>
            <div className="space-y-2">
              {[
                { value: "MANUAL", label: "Manual", hint: "Creates an alert — you review and apply it" },
                { value: "AUTO", label: "Auto", hint: "Fires immediately when condition is met" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="trigger_mode" value={opt.value} checked={form.trigger_mode === opt.value} onChange={set("trigger_mode")} className="mt-0.5" />
                  <span className="text-sm">
                    <span className="font-medium">{opt.label}</span>
                    <span className="block text-xs text-gray-400">{opt.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-6">
          <Button type="button" variant="secondary" onClick={() => navigate("/billing/dispute-rules")}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </Card>
    </form>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Create Dispute Rule" backTo="/billing/dispute-rules" />
      {formContent}
    </div>
  );
}
