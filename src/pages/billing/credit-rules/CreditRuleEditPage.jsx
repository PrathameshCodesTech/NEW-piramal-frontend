import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { creditRulesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
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
  { value: "OPERATIONS_MANAGER", label: "Operations Manager" },
  { value: "FINANCE_HEAD", label: "Finance Head" },
  { value: "CFO", label: "CFO" },
];
const VARIANCE_BASIS_OPTIONS = [
  { value: "PERCENTAGE", label: "Percentage (%)" },
  { value: "FIXED_AMOUNT", label: "Fixed Amount" },
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

export default function CreditRuleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    trigger_type: "PAYMENT_VARIANCE",
    variance_basis: "PERCENTAGE",
    variance_threshold: "",
    max_credit_amount: "",
    approval_level: "AR_SUPERVISOR",
    auto_approve: false,
    auto_post_to_gl: false,
    requires_documentation: false,
    status: "ACTIVE",
  });

  useEffect(() => {
    setLoadingData(true);
    creditRulesAPI
      .get(id)
      .then((data) => {
        setForm({
          name: data.name || "",
          description: data.description || "",
          trigger_type: data.trigger_type || "PAYMENT_VARIANCE",
          variance_basis: data.variance_basis || "PERCENTAGE",
          variance_threshold: data.variance_threshold != null ? String(data.variance_threshold) : "",
          max_credit_amount: data.max_credit_amount != null ? String(data.max_credit_amount) : "",
          approval_level: data.approval_level || "AR_SUPERVISOR",
          auto_approve: !!data.auto_approve,
          auto_post_to_gl: !!data.auto_post_to_gl,
          requires_documentation: !!data.requires_documentation,
          status: data.status || "ACTIVE",
        });
      })
      .catch(() => toast.error("Rule not found"))
      .finally(() => setLoadingData(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        trigger_type: form.trigger_type,
        variance_basis: form.variance_basis,
        approval_level: form.approval_level,
        auto_approve: form.auto_approve,
        auto_post_to_gl: form.auto_post_to_gl,
        requires_documentation: form.requires_documentation,
        status: form.status,
      };
      if (form.variance_threshold) payload.variance_threshold = parseFloat(form.variance_threshold);
      else delete payload.variance_threshold;
      if (form.max_credit_amount) payload.max_credit_amount = parseFloat(form.max_credit_amount);
      else delete payload.max_credit_amount;
      await creditRulesAPI.update(id, payload);
      toast.success("Credit rule updated");
      navigate(`/billing/credit-rules/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to update credit rule");
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) =>
    setForm((p) => ({ ...p, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  if (loadingData) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Edit Credit Rule" backTo={`/billing/credit-rules/${id}`} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 max-w-xl">
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={set("name")} required />
            <Input label="Description" value={form.description} onChange={set("description")} />
            <Select label="Trigger Type" value={form.trigger_type} onChange={set("trigger_type")} options={TRIGGER_OPTIONS} />

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Variance / Amount</p>
              <div className="space-y-3">
                <Select label="Variance Basis" value={form.variance_basis} onChange={set("variance_basis")} options={VARIANCE_BASIS_OPTIONS} />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={form.variance_basis === "PERCENTAGE" ? "Variance Threshold (%)" : "Variance Threshold (amount)"}
                    type="number" step="0.01"
                    value={form.variance_threshold}
                    onChange={set("variance_threshold")}
                    placeholder="Optional"
                  />
                  <Input label="Max Credit Amount" type="number" step="0.01" value={form.max_credit_amount} onChange={set("max_credit_amount")} placeholder="Optional cap" />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Approval</p>
              <div className="space-y-3">
                <Select label="Approval Level" value={form.approval_level} onChange={set("approval_level")} options={APPROVAL_OPTIONS} />
                <Chk label="Auto-approve (no manual approval needed)" checked={form.auto_approve} onChange={set("auto_approve")} />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Processing</p>
              <div className="space-y-2">
                <Chk label="Auto-post to GL on approval" checked={form.auto_post_to_gl} onChange={set("auto_post_to_gl")} />
                <Chk label="Requires supporting documentation" checked={form.requires_documentation} onChange={set("requires_documentation")} />
              </div>
            </div>

            <div className="border-t pt-4">
              <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
            </div>
          </div>
          <div className="flex gap-2 pt-6">
            <Button type="button" variant="secondary" onClick={() => navigate(`/billing/credit-rules/${id}`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
