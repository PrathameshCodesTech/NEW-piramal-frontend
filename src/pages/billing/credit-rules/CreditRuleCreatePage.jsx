import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { creditRulesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const TRIGGER_OPTIONS = [
  { value: "PAYMENT_VARIANCE", label: "Payment Variance" },
  { value: "BILLING_ERROR", label: "Billing Error" },
  { value: "SERVICE_CREDIT", label: "Service Credit" },
  { value: "GOODWILL", label: "Goodwill" },
  { value: "DISCOUNT_REQUEST", label: "Approved Discount Request" },
  { value: "RETURN_REQUEST", label: "Validated Return Request" },
];
const APPROVAL_OPTIONS = [
  { value: "AR_EXECUTIVE", label: "AR Executive" },
  { value: "AR_SUPERVISOR", label: "AR Supervisor" },
  { value: "AR_MANAGER", label: "AR Manager" },
  { value: "FINANCE_HEAD", label: "Finance Head" },
  { value: "CFO", label: "CFO" },
];
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function CreditRuleCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    trigger_type: "PAYMENT_VARIANCE",
    variance_threshold: "",
    approval_level: "AR_SUPERVISOR",
    auto_approve: false,
    status: "ACTIVE",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.variance_threshold) payload.variance_threshold = parseFloat(form.variance_threshold);
      const res = await creditRulesAPI.create(payload);
      toast.success("Credit rule created");
      navigate("/billing/credit-rules/" + res.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const content = (
    <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-xl"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={form.name} onChange={set("name")} required />
        <Input label="Description" value={form.description} onChange={set("description")} />
        <Select label="Trigger Type" value={form.trigger_type} onChange={set("trigger_type")} options={TRIGGER_OPTIONS} />
        <Input label="Variance Threshold (optional)" type="number" step="0.01" value={form.variance_threshold} onChange={set("variance_threshold")} />
        <Select label="Approval Level" value={form.approval_level} onChange={set("approval_level")} options={APPROVAL_OPTIONS} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.auto_approve} onChange={set("auto_approve")} className="rounded" />Auto approve</label>
        <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate("/billing/credit-rules")}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </form>
    </Card>
  );

  if (inModal) return content;
  return (
    <div>
      <div className="mb-6"><h1 className="text-xl font-semibold">Create Credit Rule</h1></div>
      {content}
    </div>
  );
}
