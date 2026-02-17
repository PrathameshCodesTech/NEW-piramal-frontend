import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import { Calendar, TrendingUp, Building2, Shield, Receipt } from "lucide-react";
import {
  BILLING_FREQ_OPTIONS,
  CAM_BASIS_OPTIONS,
  calculateAnnualRentFromMonthly,
  ESCALATION_TYPE_OPTIONS,
  INVOICE_RULE_OPTIONS,
  PAYMENT_DUE_OPTIONS,
} from "../constants";

export default function FinancialsTab({
  form,
  setForm,
  templateOptions,
  effectiveBaseRentMonthly = null,
  totalAllocatedAreaSqft = null,
  bufferSummary = null,
  onSubmit,
  saving,
}) {
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const toggle = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.checked }));
  const displayedBaseRentMonthly = effectiveBaseRentMonthly ?? form.base_rent_monthly ?? "";
  const annualRent = calculateAnnualRentFromMonthly(displayedBaseRentMonthly);
  const isTemplateDrivenEscalation = !!form.escalation_template;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Term & Rent */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Term & Rent</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Commencement Date" type="date" value={form.commencement_date} onChange={set("commencement_date")} />
          <Input label="Expiry Date" type="date" value={form.expiry_date} onChange={set("expiry_date")} />
          <Input label="Term (Months)" type="number" value={form.initial_term_months} onChange={set("initial_term_months")} />
          <Input
            label="Base Rent Monthly (Auto)"
            type="number"
            step="0.01"
            value={displayedBaseRentMonthly}
            readOnly
          />
          <Input label="Rate / Sqft" type="number" step="0.01" value={form.rate_per_sqft_monthly} onChange={set("rate_per_sqft_monthly")} />
          <Input
            label="Annual Rent"
            type="number"
            step="0.01"
            value={annualRent ?? ""}
            readOnly
          />
          <Select label="Billing Frequency" value={form.billing_frequency} onChange={set("billing_frequency")} options={BILLING_FREQ_OPTIONS} />
          <Select label="Payment Due" value={form.payment_due_date} onChange={set("payment_due_date")} options={PAYMENT_DUE_OPTIONS} />
          <Input label="First Rent Due Date" type="date" value={form.first_rent_due_date} onChange={set("first_rent_due_date")} />
          <Input label="Currency" value={form.currency} onChange={set("currency")} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {effectiveBaseRentMonthly !== null
            ? `Base Rent Monthly is auto-derived from Rate / Sqft x allocated area (${Number(totalAllocatedAreaSqft || 0).toLocaleString()} sqft). Annual Rent follows automatically.`
            : "Set Rate / Sqft and allocation area to auto-calculate Base Rent Monthly and Annual Rent."}
        </p>
      </div>

      {/* Buffer & Proration */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Buffer & Proration (Calendar Day)</h4>
        <p className="text-xs text-gray-500 mb-4">
          Rent-free / reduced-rent period at lease start. Primary buffer = 0% charge; extended buffer = partial charge. Proration uses actual days per month.
        </p>

        {/* Inputs */}
        <div className="mb-6">
          <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">Buffer Settings</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Primary Buffer Days (0% rent)"
              type="number"
              value={form.rent_free_days}
              onChange={set("rent_free_days")}
              min="0"
              placeholder="e.g. 75"
            />
            <Input
              label="Extended Buffer Days (partial %)"
              type="number"
              value={form.extended_buffer_days}
              onChange={set("extended_buffer_days")}
              min="0"
            />
            <Input
              label="Extended Buffer Charge %"
              type="number"
              step="0.01"
              value={form.extended_buffer_charge_percent}
              onChange={set("extended_buffer_charge_percent")}
              min="0"
              max="100"
              placeholder="50"
            />
          </div>
        </div>

        {/* Buffer Period Dates */}
        <div className="mb-6">
          <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">Buffer Period Dates</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Primary Buffer Start" value={bufferSummary?.primaryBufferStartDate || ""} readOnly />
            <Input label="Primary Buffer End" value={bufferSummary?.primaryBufferEndDate || ""} readOnly />
            <Input label="Extended Buffer Start" value={bufferSummary?.extendedBufferStartDate || ""} readOnly />
            <Input label="Extended Buffer End" value={bufferSummary?.extendedBufferEndDate || ""} readOnly />
            <Input label="First Charge Date" value={bufferSummary?.firstChargeDate || ""} readOnly />
            <Input label="Full Charge Date" value={bufferSummary?.fullChargeDate || ""} readOnly />
          </div>
        </div>

        {/* First Year Calculation Summary - Crystal Clear */}
        <div className="mb-6 p-4 bg-white border border-emerald-200 rounded-lg">
          <h5 className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-3">First Year Calculation Summary</h5>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Monthly Rent (Gross)"
                type="number"
                step="0.01"
                value={displayedBaseRentMonthly ?? ""}
                readOnly
              />
              <Input
                label="Per-Day Rent (Commence Month)"
                type="number"
                step="0.01"
                value={bufferSummary?.currentDailyBaseRent ?? ""}
                readOnly
              />
              <Input
                label="Annual Gross Rent (Year 1)"
                type="number"
                step="0.01"
                value={bufferSummary?.annualGrossRent ?? ""}
                readOnly
              />
              <Input
                label="Primary Buffer Concession"
                type="number"
                step="0.01"
                value={bufferSummary?.annualPrimaryBufferConcession ?? ""}
                readOnly
              />
              <Input
                label="Extended Buffer Concession"
                type="number"
                step="0.01"
                value={bufferSummary?.annualExtendedBufferConcession ?? ""}
                readOnly
              />
              <Input
                label="Total Buffer Concession (Year 1)"
                type="number"
                step="0.01"
                value={
                  bufferSummary?.annualPrimaryBufferConcession != null && bufferSummary?.annualExtendedBufferConcession != null
                    ? (
                        Number(bufferSummary.annualPrimaryBufferConcession || 0) +
                        Number(bufferSummary.annualExtendedBufferConcession || 0)
                      ).toFixed(2)
                    : ""
                }
                readOnly
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 py-2 px-3 bg-emerald-50 rounded border border-emerald-100">
              <span className="text-sm font-medium text-gray-700">First Year Net =</span>
              <span className="text-sm text-gray-600">Annual Gross − Total Buffer Concession</span>
              <span className="text-sm text-gray-400">=</span>
              <span className="text-sm font-semibold text-emerald-700">
                {bufferSummary?.annualGrossRent != null &&
                (bufferSummary?.annualPrimaryBufferConcession != null || bufferSummary?.annualExtendedBufferConcession != null)
                  ? (
                      Number(bufferSummary.annualGrossRent || 0) -
                      (Number(bufferSummary.annualPrimaryBufferConcession || 0) +
                        Number(bufferSummary.annualExtendedBufferConcession || 0))
                    ).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                  : "—"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
              <Input
                label="First Year Net Collectible"
                type="number"
                step="0.01"
                value={bufferSummary?.annualNetCollectible ?? ""}
                readOnly
              />
              <Input
                label="Effective Monthly Rent (Year 1)"
                type="number"
                step="0.01"
                value={bufferSummary?.effectiveMonthlyRent ?? ""}
                readOnly
              />
              <Input
                label="Effective Rate / Sqft (Year 1)"
                type="number"
                step="0.01"
                value={bufferSummary?.effectiveRatePerSqft ?? ""}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Invoice Amounts */}
        <div>
          <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">Invoice Amounts</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Invoice Amount"
              type="number"
              step="0.01"
              value={bufferSummary?.firstInvoiceAmount ?? ""}
              readOnly
            />
            <Input
              label="Next Cycle Amount"
              type="number"
              step="0.01"
              value={bufferSummary?.nextCycleAmount ?? ""}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Escalation */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Escalation</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Template" value={form.escalation_template} onChange={set("escalation_template")} options={templateOptions} />
          <Select
            label="Escalation Type"
            value={form.escalation_type}
            onChange={set("escalation_type")}
            options={ESCALATION_TYPE_OPTIONS}
            disabled={isTemplateDrivenEscalation}
          />
          <Input
            label="Escalation Value"
            type="number"
            step="0.01"
            value={form.escalation_value}
            onChange={set("escalation_value")}
            readOnly={isTemplateDrivenEscalation}
          />
          <Input
            label="Frequency (Months)"
            type="number"
            value={form.escalation_frequency_months}
            onChange={set("escalation_frequency_months")}
            readOnly={isTemplateDrivenEscalation}
          />
          <Input
            label="First Escalation (Months)"
            type="number"
            value={form.first_escalation_months}
            onChange={set("first_escalation_months")}
            readOnly={isTemplateDrivenEscalation}
          />
        </div>
        {isTemplateDrivenEscalation && (
          <p className="text-xs text-gray-500 mt-2">Escalation values are auto-filled from the selected template.</p>
        )}
        <div className="flex gap-5 mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.apply_to_cam}
              onChange={toggle("apply_to_cam")}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              disabled={isTemplateDrivenEscalation}
            />
            Apply to CAM
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.apply_to_parking}
              onChange={toggle("apply_to_parking")}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              disabled={isTemplateDrivenEscalation}
            />
            Apply to Parking
          </label>
        </div>
      </div>

      {/* CAM Charges */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">CAM Charges</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="CAM Basis" value={form.cam_allocation_basis} onChange={set("cam_allocation_basis")} options={CAM_BASIS_OPTIONS} />
          <Input label="CAM / Sqft" type="number" step="0.01" value={form.cam_per_sqft_monthly} onChange={set("cam_per_sqft_monthly")} />
          <Input label="CAM Fixed Amount" type="number" step="0.01" value={form.cam_fixed_amount_monthly} onChange={set("cam_fixed_amount_monthly")} />
          <Input label="CAM %" type="number" step="0.01" value={form.cam_percentage_value} onChange={set("cam_percentage_value")} />
          <Input label="CAM Monthly Total" type="number" step="0.01" value={form.cam_monthly_total} onChange={set("cam_monthly_total")} />
        </div>
      </div>

      {/* Deposit */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Deposit</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Deposit Amount" type="number" step="0.01" value={form.deposit_amount} onChange={set("deposit_amount")} />
          <Input label="Deposit Months" type="number" value={form.deposit_months_equivalent} onChange={set("deposit_months_equivalent")} />
        </div>
      </div>

      {/* Billing Rules & Taxes */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Billing Rules & Taxes</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Invoice Rule" value={form.invoice_generate_rule} onChange={set("invoice_generate_rule")} options={INVOICE_RULE_OPTIONS} />
          <Input label="Grace Days" type="number" value={form.grace_days} onChange={set("grace_days")} />
          <Input label="Late Fee Flat" type="number" step="0.01" value={form.late_fee_flat} onChange={set("late_fee_flat")} />
          <Input label="Late Fee %" type="number" step="0.01" value={form.late_fee_percent} onChange={set("late_fee_percent")} />
          <Input label="Interest Annual %" type="number" step="0.01" value={form.interest_annual_percent} onChange={set("interest_annual_percent")} />
          <Input label="GST Rate" type="number" step="0.01" value={form.gst_rate} onChange={set("gst_rate")} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 mt-3">
          <input type="checkbox" checked={form.gst_applicable} onChange={toggle("gst_applicable")} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
          GST applicable
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={saving}>
          Save Financials
        </Button>
      </div>
    </form>
  );
}
