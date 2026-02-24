import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { billingRulesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

const CATEGORY_OPTIONS = [
  { value: "RENTAL", label: "Rental" },
  { value: "CONTRACT", label: "Contract" },
  { value: "SERVICE", label: "Service" },
  { value: "UTILITY", label: "Utility" },
];
const APPLIES_OPTIONS = [
  { value: "LEASE", label: "Lease" },
  { value: "PROPERTY", label: "Property" },
];
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];
const CHARGE_TYPE_OPTIONS = [
  { value: "LATE_PAYMENT_FEE", label: "Late Payment Fee" },
  { value: "INTEREST", label: "Interest" },
  { value: "PENALTY", label: "Penalty" },
  { value: "ADMINISTRATIVE_FEE", label: "Administrative Fee" },
  { value: "CAM_RECONCILIATION", label: "CAM Reconciliation" },
  { value: "OTHER", label: "Other" },
];
const CALCULATION_OPTIONS = [
  { value: "FLAT", label: "Flat Amount" },
  { value: "PERCENTAGE_OF_OUTSTANDING", label: "% of Outstanding" },
  { value: "PERCENTAGE_OF_RENT", label: "% of Rent" },
  { value: "PER_DAY", label: "Per Day (flat × overdue days)" },
];
const TRIGGER_EVENT_OPTIONS = [
  { value: "OVERDUE", label: "When Invoice is Overdue" },
  { value: "MONTHLY", label: "Monthly (recurring)" },
  { value: "ON_INVOICE", label: "On Invoice Generation" },
  { value: "MANUAL_ONLY", label: "Manual Trigger Only" },
];

const isPercentage = (m) => m === "PERCENTAGE_OF_OUTSTANDING" || m === "PERCENTAGE_OF_RENT";

export default function BillingRuleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    billingRulesAPI.get(id).then((data) => {
      setForm({
        name: data.name || "",
        description: data.description || "",
        category: data.category || "RENTAL",
        applies_to: data.applies_to || "LEASE",
        status: data.status || "DRAFT",
        charge_type: data.charge_type || "LATE_PAYMENT_FEE",
        calculation_method: data.calculation_method || "FLAT",
        amount: data.amount != null ? String(data.amount) : "",
        rate: data.rate != null ? String(data.rate) : "",
        max_cap_amount: data.max_cap_amount != null ? String(data.max_cap_amount) : "",
        trigger_event: data.trigger_event || "OVERDUE",
        grace_period_days: data.grace_period_days != null ? String(data.grace_period_days) : "0",
        gl_code: data.gl_code || "",
        trigger_mode: data.trigger_mode || "MANUAL",
      });
    }).catch(() => toast.error("Rule not found"));
  }, [id]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        applies_to: form.applies_to,
        status: form.status,
        charge_type: form.charge_type,
        calculation_method: form.calculation_method,
        trigger_event: form.trigger_event,
        grace_period_days: parseInt(form.grace_period_days, 10) || 0,
        gl_code: form.gl_code || "",
        trigger_mode: form.trigger_mode,
        amount: isPercentage(form.calculation_method) ? null : (parseFloat(form.amount) || null),
        rate: isPercentage(form.calculation_method) ? (parseFloat(form.rate) || null) : null,
        max_cap_amount: form.max_cap_amount ? parseFloat(form.max_cap_amount) : null,
      };
      await billingRulesAPI.update(id, payload);
      toast.success("Billing rule updated");
      navigate(`/billing/rules/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Edit Billing Rule" backTo={`/billing/rules/${id}`} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 max-w-xl">
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={set("name")} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={set("description")} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={set("category")} options={CATEGORY_OPTIONS} />
              <Select label="Applies To" value={form.applies_to} onChange={set("applies_to")} options={APPLIES_OPTIONS} />
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Charge</p>
              <div className="space-y-3">
                <Select label="Charge Type" value={form.charge_type} onChange={set("charge_type")} options={CHARGE_TYPE_OPTIONS} />
                <Select label="Calculation Method" value={form.calculation_method} onChange={set("calculation_method")} options={CALCULATION_OPTIONS} />
                {isPercentage(form.calculation_method) ? (
                  <Input
                    label="Rate (%)"
                    type="number" step="0.0001" min="0"
                    value={form.rate}
                    onChange={set("rate")}
                    placeholder="e.g. 2.00 for 2%"
                    required
                  />
                ) : (
                  <Input
                    label={form.calculation_method === "PER_DAY" ? "Amount per Day (₹)" : "Flat Amount (₹)"}
                    type="number" step="0.01" min="0"
                    value={form.amount}
                    onChange={set("amount")}
                    placeholder="e.g. 500"
                    required
                  />
                )}
                <Input
                  label="Max Cap Amount (₹, optional)"
                  type="number" step="0.01" min="0"
                  value={form.max_cap_amount}
                  onChange={set("max_cap_amount")}
                  placeholder="Leave blank for no ceiling"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Trigger</p>
              <div className="space-y-3">
                <Select label="Trigger Event" value={form.trigger_event} onChange={set("trigger_event")} options={TRIGGER_EVENT_OPTIONS} />
                <Input
                  label="Grace Period (days)"
                  type="number" min="0"
                  value={form.grace_period_days}
                  onChange={set("grace_period_days")}
                  placeholder="0 = fire immediately on trigger"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Input label="GL Code (optional)" value={form.gl_code} onChange={set("gl_code")} placeholder="e.g. 4100-LATE-FEE" />
            </div>

            <div className="border-t pt-4">
              <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Trigger Mode</p>
              <div className="space-y-2">
                {[
                  { value: "MANUAL", label: "Manual", hint: "Creates a pending action alert — you review and apply it" },
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
            <Button type="button" variant="secondary" onClick={() => navigate(`/billing/rules/${id}`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
