import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import {
  BILLING_FREQ_OPTIONS,
  CAM_BASIS_OPTIONS,
  ESCALATION_TYPE_OPTIONS,
  INVOICE_RULE_OPTIONS,
  PAYMENT_DUE_OPTIONS,
} from "../constants";

export default function FinancialsTab({ form, setForm, templateOptions, onSubmit, saving }) {
  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Term & Rent</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Commencement Date"
              type="date"
              value={form.commencement_date}
              onChange={(e) => setForm((p) => ({ ...p, commencement_date: e.target.value }))}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm((p) => ({ ...p, expiry_date: e.target.value }))}
            />
            <Input
              label="Term (Months)"
              type="number"
              value={form.initial_term_months}
              onChange={(e) => setForm((p) => ({ ...p, initial_term_months: e.target.value }))}
            />
            <Input
              label="Base Rent Monthly"
              type="number"
              step="0.01"
              value={form.base_rent_monthly}
              onChange={(e) => setForm((p) => ({ ...p, base_rent_monthly: e.target.value }))}
            />
            <Input
              label="Rate / Sqft"
              type="number"
              step="0.01"
              value={form.rate_per_sqft_monthly}
              onChange={(e) => setForm((p) => ({ ...p, rate_per_sqft_monthly: e.target.value }))}
            />
            <Input
              label="Annual Rent"
              type="number"
              step="0.01"
              value={form.annual_rent}
              onChange={(e) => setForm((p) => ({ ...p, annual_rent: e.target.value }))}
            />
            <Select
              label="Billing Frequency"
              value={form.billing_frequency}
              onChange={(e) => setForm((p) => ({ ...p, billing_frequency: e.target.value }))}
              options={BILLING_FREQ_OPTIONS}
            />
            <Select
              label="Payment Due"
              value={form.payment_due_date}
              onChange={(e) => setForm((p) => ({ ...p, payment_due_date: e.target.value }))}
              options={PAYMENT_DUE_OPTIONS}
            />
            <Input
              label="First Rent Due Date"
              type="date"
              value={form.first_rent_due_date}
              onChange={(e) => setForm((p) => ({ ...p, first_rent_due_date: e.target.value }))}
            />
            <Input
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Escalation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Select
              label="Template"
              value={form.escalation_template}
              onChange={(e) => setForm((p) => ({ ...p, escalation_template: e.target.value }))}
              options={templateOptions}
            />
            <Select
              label="Escalation Type"
              value={form.escalation_type}
              onChange={(e) => setForm((p) => ({ ...p, escalation_type: e.target.value }))}
              options={ESCALATION_TYPE_OPTIONS}
            />
            <Input
              label="Escalation Value"
              type="number"
              step="0.01"
              value={form.escalation_value}
              onChange={(e) => setForm((p) => ({ ...p, escalation_value: e.target.value }))}
            />
            <Input
              label="Frequency (Months)"
              type="number"
              value={form.escalation_frequency_months}
              onChange={(e) => setForm((p) => ({ ...p, escalation_frequency_months: e.target.value }))}
            />
            <Input
              label="First Escalation (Months)"
              type="number"
              value={form.first_escalation_months}
              onChange={(e) => setForm((p) => ({ ...p, first_escalation_months: e.target.value }))}
            />
          </div>
          <div className="flex gap-5 mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.apply_to_cam}
                onChange={(e) => setForm((p) => ({ ...p, apply_to_cam: e.target.checked }))}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Apply to CAM
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.apply_to_parking}
                onChange={(e) => setForm((p) => ({ ...p, apply_to_parking: e.target.checked }))}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Apply to Parking
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">CAM, Deposit & Billing Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Select
              label="CAM Basis"
              value={form.cam_allocation_basis}
              onChange={(e) => setForm((p) => ({ ...p, cam_allocation_basis: e.target.value }))}
              options={CAM_BASIS_OPTIONS}
            />
            <Input
              label="CAM / Sqft"
              type="number"
              step="0.01"
              value={form.cam_per_sqft_monthly}
              onChange={(e) => setForm((p) => ({ ...p, cam_per_sqft_monthly: e.target.value }))}
            />
            <Input
              label="CAM Fixed Amount"
              type="number"
              step="0.01"
              value={form.cam_fixed_amount_monthly}
              onChange={(e) => setForm((p) => ({ ...p, cam_fixed_amount_monthly: e.target.value }))}
            />
            <Input
              label="CAM %"
              type="number"
              step="0.01"
              value={form.cam_percentage_value}
              onChange={(e) => setForm((p) => ({ ...p, cam_percentage_value: e.target.value }))}
            />
            <Input
              label="CAM Monthly Total"
              type="number"
              step="0.01"
              value={form.cam_monthly_total}
              onChange={(e) => setForm((p) => ({ ...p, cam_monthly_total: e.target.value }))}
            />
            <Input
              label="Deposit Amount"
              type="number"
              step="0.01"
              value={form.deposit_amount}
              onChange={(e) => setForm((p) => ({ ...p, deposit_amount: e.target.value }))}
            />
            <Input
              label="Deposit Months"
              type="number"
              value={form.deposit_months_equivalent}
              onChange={(e) => setForm((p) => ({ ...p, deposit_months_equivalent: e.target.value }))}
            />
            <Select
              label="Invoice Rule"
              value={form.invoice_generate_rule}
              onChange={(e) => setForm((p) => ({ ...p, invoice_generate_rule: e.target.value }))}
              options={INVOICE_RULE_OPTIONS}
            />
            <Input
              label="Grace Days"
              type="number"
              value={form.grace_days}
              onChange={(e) => setForm((p) => ({ ...p, grace_days: e.target.value }))}
            />
            <Input
              label="Late Fee Flat"
              type="number"
              step="0.01"
              value={form.late_fee_flat}
              onChange={(e) => setForm((p) => ({ ...p, late_fee_flat: e.target.value }))}
            />
            <Input
              label="Late Fee %"
              type="number"
              step="0.01"
              value={form.late_fee_percent}
              onChange={(e) => setForm((p) => ({ ...p, late_fee_percent: e.target.value }))}
            />
            <Input
              label="Interest Annual %"
              type="number"
              step="0.01"
              value={form.interest_annual_percent}
              onChange={(e) => setForm((p) => ({ ...p, interest_annual_percent: e.target.value }))}
            />
            <Input
              label="GST Rate"
              type="number"
              step="0.01"
              value={form.gst_rate}
              onChange={(e) => setForm((p) => ({ ...p, gst_rate: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <input
              type="checkbox"
              checked={form.gst_applicable}
              onChange={(e) => setForm((p) => ({ ...p, gst_applicable: e.target.checked }))}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            GST applicable
          </label>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save Financials
          </Button>
        </div>
      </form>
    </Card>
  );
}

