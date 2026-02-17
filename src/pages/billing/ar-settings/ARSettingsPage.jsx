import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { arGlobalSettingsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

export default function ARSettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    enable_dispute_management: true,
    enable_credit_note_workflow: true,
    default_dispute_hold_collection: true,
    default_stop_interest_on_dispute: true,
    default_stop_reminders_on_dispute: true,
    credit_note_requires_approval: true,
    max_auto_credit_percent: "2.00",
  });

  const loadData = () => {
    setLoading(true);
    arGlobalSettingsAPI
      .list()
      .then((res) => {
        setData(res);
        setForm({
          enable_dispute_management: res?.enable_dispute_management ?? true,
          enable_credit_note_workflow: res?.enable_credit_note_workflow ?? true,
          default_dispute_hold_collection: res?.default_dispute_hold_collection ?? true,
          default_stop_interest_on_dispute: res?.default_stop_interest_on_dispute ?? true,
          default_stop_reminders_on_dispute: res?.default_stop_reminders_on_dispute ?? true,
          credit_note_requires_approval: res?.credit_note_requires_approval ?? true,
          max_auto_credit_percent: res?.max_auto_credit_percent != null ? String(res.max_auto_credit_percent) : "2.00",
        });
      })
      .catch(() => {
        setData({}); // Show form with defaults; update endpoint will create on first save
        setForm({
          enable_dispute_management: true,
          enable_credit_note_workflow: true,
          default_dispute_hold_collection: true,
          default_stop_interest_on_dispute: true,
          default_stop_reminders_on_dispute: true,
          credit_note_requires_approval: true,
          max_auto_credit_percent: "2.00",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const set = (f) => (e) =>
    setForm((p) => ({
      ...p,
      [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        enable_dispute_management: form.enable_dispute_management,
        enable_credit_note_workflow: form.enable_credit_note_workflow,
        default_dispute_hold_collection: form.default_dispute_hold_collection,
        default_stop_interest_on_dispute: form.default_stop_interest_on_dispute,
        default_stop_reminders_on_dispute: form.default_stop_reminders_on_dispute,
        credit_note_requires_approval: form.credit_note_requires_approval,
        max_auto_credit_percent: parseFloat(form.max_auto_credit_percent) || 2,
      };
      const updated = await arGlobalSettingsAPI.update(payload);
      setData(updated);
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
      <Card className="p-6 max-w-xl">
        <h3 className="text-sm font-semibold mb-4">AR Global Settings</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.enable_dispute_management}
                onChange={set("enable_dispute_management")}
                className="rounded"
              />
              <span className="text-sm">Enable dispute management</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.enable_credit_note_workflow}
                onChange={set("enable_credit_note_workflow")}
                className="rounded"
              />
              <span className="text-sm">Enable credit note workflow</span>
            </label>
          </div>
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs text-gray-500 font-medium">Dispute defaults</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.default_dispute_hold_collection}
                onChange={set("default_dispute_hold_collection")}
                className="rounded"
              />
              <span className="text-sm">Hold collection when invoice is disputed</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.default_stop_interest_on_dispute}
                onChange={set("default_stop_interest_on_dispute")}
                className="rounded"
              />
              <span className="text-sm">Stop interest accrual during dispute</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.default_stop_reminders_on_dispute}
                onChange={set("default_stop_reminders_on_dispute")}
                className="rounded"
              />
              <span className="text-sm">Stop payment reminders during dispute</span>
            </label>
          </div>
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs text-gray-500 font-medium">Credit note defaults</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.credit_note_requires_approval}
                onChange={set("credit_note_requires_approval")}
                className="rounded"
              />
              <span className="text-sm">Require approval for credit notes</span>
            </label>
            <Input
              label="Max auto-credit percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.max_auto_credit_percent}
              onChange={set("max_auto_credit_percent")}
            />
          </div>
          <div className="pt-4">
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
