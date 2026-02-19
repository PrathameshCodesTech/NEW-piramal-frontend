import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { arGlobalSettingsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const REVENUE_RECOGNITION_OPTIONS = [
  { value: "ACCRUAL_BASIS", label: "Accrual Basis" },
  { value: "CASH_BASIS", label: "Cash Basis" },
  { value: "HYBRID", label: "Hybrid" },
];

const DEFAULT_FORM = {
  enable_dispute_management: true,
  enable_credit_note_workflow: true,
  default_dispute_hold_collection: true,
  default_stop_interest_on_dispute: true,
  default_stop_reminders_on_dispute: true,
  credit_note_requires_approval: true,
  max_auto_credit_percent: "2.00",
  revenue_recognition_rule: "ACCRUAL_BASIS",
  eligible_for_dunning: true,
  include_in_auto_email_batch: true,
};

const Chk = ({ label, description, checked, onChange }) => (
  <label className="flex items-start gap-2 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="rounded mt-0.5" />
    <span className="text-sm">
      {label}
      {description && <span className="block text-xs text-gray-400 font-normal">{description}</span>}
    </span>
  </label>
);

export default function ARSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const loadData = () => {
    setLoading(true);
    arGlobalSettingsAPI
      .list()
      .then((res) => {
        setForm({
          enable_dispute_management: res?.enable_dispute_management ?? true,
          enable_credit_note_workflow: res?.enable_credit_note_workflow ?? true,
          default_dispute_hold_collection: res?.default_dispute_hold_collection ?? true,
          default_stop_interest_on_dispute: res?.default_stop_interest_on_dispute ?? true,
          default_stop_reminders_on_dispute: res?.default_stop_reminders_on_dispute ?? true,
          credit_note_requires_approval: res?.credit_note_requires_approval ?? true,
          max_auto_credit_percent: res?.max_auto_credit_percent != null ? String(res.max_auto_credit_percent) : "2.00",
          revenue_recognition_rule: res?.revenue_recognition_rule || "ACCRUAL_BASIS",
          eligible_for_dunning: res?.eligible_for_dunning ?? true,
          include_in_auto_email_batch: res?.include_in_auto_email_batch ?? true,
        });
      })
      .catch(() => {
        setForm(DEFAULT_FORM);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const set = (f) => (e) =>
    setForm((p) => ({
      ...p,
      [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await arGlobalSettingsAPI.update({
        enable_dispute_management: form.enable_dispute_management,
        enable_credit_note_workflow: form.enable_credit_note_workflow,
        default_dispute_hold_collection: form.default_dispute_hold_collection,
        default_stop_interest_on_dispute: form.default_stop_interest_on_dispute,
        default_stop_reminders_on_dispute: form.default_stop_reminders_on_dispute,
        credit_note_requires_approval: form.credit_note_requires_approval,
        max_auto_credit_percent: parseFloat(form.max_auto_credit_percent) || 2,
        revenue_recognition_rule: form.revenue_recognition_rule,
        eligible_for_dunning: form.eligible_for_dunning,
        include_in_auto_email_batch: form.include_in_auto_email_batch,
      });
      toast.success("AR settings saved");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div>
        <PageHeader title="AR Settings" />
        <div className="py-12 text-center">Loading...</div>
      </div>
    );

  return (
    <div>
      <PageHeader title="AR Settings" />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* Workflow toggles */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Workflow</h3>
          <div className="space-y-3">
            <Chk label="Enable dispute management" checked={form.enable_dispute_management} onChange={set("enable_dispute_management")} />
            <Chk label="Enable credit note workflow" checked={form.enable_credit_note_workflow} onChange={set("enable_credit_note_workflow")} />
          </div>
        </Card>

        {/* Dispute defaults */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Dispute Defaults</h3>
          <div className="space-y-3">
            <Chk label="Hold collection when invoice is disputed" checked={form.default_dispute_hold_collection} onChange={set("default_dispute_hold_collection")} />
            <Chk label="Stop interest accrual during dispute" checked={form.default_stop_interest_on_dispute} onChange={set("default_stop_interest_on_dispute")} />
            <Chk label="Stop payment reminders during dispute" checked={form.default_stop_reminders_on_dispute} onChange={set("default_stop_reminders_on_dispute")} />
          </div>
        </Card>

        {/* Credit note defaults */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Credit Note Defaults</h3>
          <div className="space-y-4">
            <Chk label="Require approval for credit notes" checked={form.credit_note_requires_approval} onChange={set("credit_note_requires_approval")} />
            <Input
              label="Max auto-credit percent (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.max_auto_credit_percent}
              onChange={set("max_auto_credit_percent")}
            />
          </div>
        </Card>

        {/* Revenue & Automation */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Revenue & Automation</h3>
          <div className="space-y-4">
            <Select
              label="Revenue Recognition Rule"
              value={form.revenue_recognition_rule}
              onChange={set("revenue_recognition_rule")}
              options={REVENUE_RECOGNITION_OPTIONS}
            />
            <Chk
              label="Eligible for dunning"
              description="Include in automated overdue follow-up sequences"
              checked={form.eligible_for_dunning}
              onChange={set("eligible_for_dunning")}
            />
            <Chk
              label="Include in auto email batch"
              description="Send invoice / reminder emails as part of scheduled batch runs"
              checked={form.include_in_auto_email_batch}
              onChange={set("include_in_auto_email_batch")}
            />
          </div>
        </Card>

        <div>
          <Button type="submit" loading={saving}>Save Settings</Button>
        </div>
      </form>
    </div>
  );
}
