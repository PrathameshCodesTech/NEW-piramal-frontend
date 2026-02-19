import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { leaseRulesAPI, agreementsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

const Chk = ({ label, description, checked, onChange }) => (
  <label className="flex items-start gap-2 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="rounded mt-0.5" />
    <span className="text-sm">
      {label}
      {description && <span className="block text-xs text-gray-400">{description}</span>}
    </span>
  </label>
);

export default function LeaseARRulesEditPage() {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([
      leaseRulesAPI.get(agreementId),
      agreementsAPI.get(agreementId),
    ]).then(([rules, ag]) => {
      setAgreement(ag);
      const ar = rules?.ar_rules || {};
      setForm({
        // Dispute
        dispute_hold: !!ar.dispute_hold,
        stop_interest_on_dispute: ar.stop_interest_on_dispute !== false,
        stop_reminders_on_dispute: ar.stop_reminders_on_dispute !== false,
        // Credit notes
        credit_note_allowed: ar.credit_note_allowed !== false,
        credit_note_requires_approval: !!ar.credit_note_requires_approval,
        max_credit_note_percent: ar.max_credit_note_percent != null ? String(ar.max_credit_note_percent) : "",
        // Reminders & escalation
        auto_reminder_enabled: !!ar.auto_reminder_enabled,
        reminder_days_before_due: ar.reminder_days_before_due != null ? String(ar.reminder_days_before_due) : "",
        reminder_days_after_due: ar.reminder_days_after_due != null ? String(ar.reminder_days_after_due) : "",
        escalation_days: ar.escalation_days != null ? String(ar.escalation_days) : "",
      });
    }).catch(() => setForm(null)).finally(() => setLoading(false));
  }, [agreementId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const ar = {
        dispute_hold: form.dispute_hold,
        stop_interest_on_dispute: form.stop_interest_on_dispute,
        stop_reminders_on_dispute: form.stop_reminders_on_dispute,
        credit_note_allowed: form.credit_note_allowed,
        credit_note_requires_approval: form.credit_note_requires_approval,
        auto_reminder_enabled: form.auto_reminder_enabled,
      };
      if (form.max_credit_note_percent) ar.max_credit_note_percent = parseFloat(form.max_credit_note_percent);
      if (form.reminder_days_before_due) ar.reminder_days_before_due = parseInt(form.reminder_days_before_due, 10);
      if (form.reminder_days_after_due) ar.reminder_days_after_due = parseInt(form.reminder_days_after_due, 10);
      if (form.escalation_days) ar.escalation_days = parseInt(form.escalation_days, 10);

      await leaseRulesAPI.update(agreementId, { ar_rules: ar });
      toast.success("AR rules updated");
      navigate("/billing/lease-rules");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [f]: v }));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!form) return <div className="text-center py-12 text-gray-500">Not found</div>;

  return (
    <div>
      <PageHeader title="Edit AR Rules" subtitle={agreement?.lease_id} backTo="/billing/lease-rules" />
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Dispute handling */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Dispute Handling</h3>
          <div className="space-y-3">
            <Chk label="Hold collection when disputed" checked={form.dispute_hold} onChange={set("dispute_hold")} />
            <Chk label="Stop interest on dispute" checked={form.stop_interest_on_dispute} onChange={set("stop_interest_on_dispute")} />
            <Chk label="Stop reminders on dispute" checked={form.stop_reminders_on_dispute} onChange={set("stop_reminders_on_dispute")} />
          </div>
        </Card>

        {/* Credit notes */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Credit Notes</h3>
          <div className="space-y-4">
            <Chk label="Allow credit notes for this agreement" checked={form.credit_note_allowed} onChange={set("credit_note_allowed")} />
            {form.credit_note_allowed && (
              <>
                <Chk
                  label="Require approval for credit notes"
                  description="Credit notes will go through the approval workflow before being applied"
                  checked={form.credit_note_requires_approval}
                  onChange={set("credit_note_requires_approval")}
                />
                <Input
                  label="Max credit note percent (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.max_credit_note_percent}
                  onChange={set("max_credit_note_percent")}
                  placeholder="e.g. 10 (blank = no limit)"
                />
              </>
            )}
          </div>
        </Card>

        {/* Reminders & escalation */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Reminders & Escalation</h3>
          <div className="space-y-4">
            <Chk
              label="Auto reminders enabled"
              description="Send automated payment reminder emails for this agreement"
              checked={form.auto_reminder_enabled}
              onChange={set("auto_reminder_enabled")}
            />
            {form.auto_reminder_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Days before due date"
                  type="number"
                  min={0}
                  value={form.reminder_days_before_due}
                  onChange={set("reminder_days_before_due")}
                  placeholder="e.g. 7"
                />
                <Input
                  label="Days after due date"
                  type="number"
                  min={0}
                  value={form.reminder_days_after_due}
                  onChange={set("reminder_days_after_due")}
                  placeholder="e.g. 3"
                />
                <Input
                  label="Escalate after (days overdue)"
                  type="number"
                  min={0}
                  value={form.escalation_days}
                  onChange={set("escalation_days")}
                  placeholder="e.g. 30"
                />
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate("/billing/lease-rules")}>Cancel</Button>
          <Button type="submit" loading={saving}>Save</Button>
        </div>
      </form>
    </div>
  );
}
