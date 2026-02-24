import { AlertTriangle, Bell, FileX, Receipt } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Card from "../../../../../components/ui/Card";
import Input from "../../../../../components/ui/Input";

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="sr-only peer" checked={!!checked} onChange={onChange} />
        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
      </div>
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

function SectionHeader({ icon: Icon, title, color = "gray" }) {
  const colors = {
    red:    "bg-red-50 border-red-100 text-red-600 bg-red-100",
    blue:   "bg-blue-50 border-blue-100 text-blue-600 bg-blue-100",
    amber:  "bg-amber-50 border-amber-100 text-amber-600 bg-amber-100",
    emerald:"bg-emerald-50 border-emerald-100 text-emerald-600 bg-emerald-100",
    gray:   "bg-gray-50 border-gray-100 text-gray-600 bg-gray-100",
  };
  const c = colors[color] ?? colors.gray;
  return (
    <div className={`flex items-center gap-2.5 pb-3 mb-4 border-b ${c.split(" ")[1]}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.split(" ")[2]} ${c.split(" ")[3]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
  );
}

export default function ARRulesTab({ form, setForm, onSubmit, saving, arRuleId }) {
  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
        <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-blue-800">Agreement-level AR overrides</p>
          <p className="text-blue-700 text-xs mt-0.5">
            These settings override the system-wide AR defaults for this specific agreement.
            Leave at defaults to inherit from global AR settings.
          </p>
        </div>
      </div>

      {/* Dispute Handling */}
      <Card className="p-5">
        <SectionHeader icon={FileX} title="Dispute Handling" color="red" />
        <div className="space-y-4">
          <Toggle
            label="Hold collection when invoice is disputed"
            hint="Pause all collection activity (reminders, late fees) while dispute is open"
            checked={form.dispute_hold}
            onChange={set("dispute_hold")}
          />
          <Toggle
            label="Stop interest accrual during dispute"
            hint="Freeze interest charges while the dispute is being resolved"
            checked={form.stop_interest_on_dispute}
            onChange={set("stop_interest_on_dispute")}
          />
          <Toggle
            label="Stop payment reminders during dispute"
            hint="Suppress automated reminder emails while dispute is open"
            checked={form.stop_reminders_on_dispute}
            onChange={set("stop_reminders_on_dispute")}
          />
        </div>
      </Card>

      {/* Credit Notes */}
      <Card className="p-5">
        <SectionHeader icon={Receipt} title="Credit Notes" color="blue" />
        <div className="space-y-4">
          <Toggle
            label="Allow credit notes for this agreement"
            hint="If disabled, no credit notes can be raised against invoices on this lease"
            checked={form.credit_note_allowed}
            onChange={set("credit_note_allowed")}
          />
          {form.credit_note_allowed && (
            <div className="ml-[52px] space-y-4">
              <Toggle
                label="Require approval for credit notes"
                hint="Credit notes must go through the approval workflow before posting"
                checked={form.credit_note_requires_approval}
                onChange={set("credit_note_requires_approval")}
              />
              <Input
                label="Max credit note (% of invoice)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.max_credit_note_percent}
                onChange={set("max_credit_note_percent")}
                placeholder="e.g. 100 — leave blank for no limit"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Collection & Reminders */}
      <Card className="p-5">
        <SectionHeader icon={Bell} title="Collection & Reminders" color="amber" />
        <div className="space-y-4">
          <Toggle
            label="Enable automated payment reminders"
            hint="Send automated emails before and after invoice due dates"
            checked={form.auto_reminder_enabled}
            onChange={set("auto_reminder_enabled")}
          />
          {form.auto_reminder_enabled && (
            <div className="ml-[52px] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Reminder days before due date"
                type="number"
                min="0"
                value={form.reminder_days_before_due}
                onChange={set("reminder_days_before_due")}
                placeholder="e.g. 7"
              />
              <Input
                label="Reminder days after due date"
                type="number"
                min="0"
                value={form.reminder_days_after_due}
                onChange={set("reminder_days_after_due")}
                placeholder="e.g. 7"
              />
            </div>
          )}
          <Input
            label="Escalation trigger (days overdue)"
            type="number"
            min="1"
            value={form.escalation_days}
            onChange={set("escalation_days")}
            placeholder="e.g. 30 — escalate to manager after 30 days overdue"
          />
        </div>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={saving}>
          {arRuleId ? "Update AR Rules" : "Save AR Rules"}
        </Button>
      </div>
    </form>
  );
}
