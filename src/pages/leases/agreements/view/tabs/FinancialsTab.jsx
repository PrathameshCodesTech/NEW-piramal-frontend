import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import {
  Calendar,
  TrendingUp,
  Building2,
  Shield,
  Receipt,
  IndianRupee,
  Maximize2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Minus,
} from "lucide-react";
import {
  BILLING_FREQ_OPTIONS,
  CAM_BASIS_OPTIONS,
  calculateAnnualRentFromMonthly,
  ESCALATION_TYPE_OPTIONS,
  INVOICE_RULE_OPTIONS,
  PAYMENT_DUE_OPTIONS,
} from "../constants";

const formatINR = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "\u2014";
  return "\u20B9" + num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatINR2 = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "\u2014";
  return "\u20B9" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const StatCard = ({ icon: Icon, label, value, sub, bg, text }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-5 h-5 ${text}`} />
    </div>
    <div className="min-w-0">
      <p className="text-lg font-bold text-gray-800 truncate">{value || "\u2014"}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SummaryRow = ({ label, value, bold, negative, className = "" }) => (
  <div className={`flex items-center justify-between py-1.5 ${className}`}>
    <span className={`text-sm ${bold ? "font-semibold text-gray-800" : "text-gray-600"}`}>
      {negative && <Minus className="w-3 h-3 inline mr-1 text-red-400" />}
      {label}
    </span>
    <span className={`text-sm font-mono ${bold ? "font-bold text-emerald-700 text-base" : negative ? "text-red-600" : "text-gray-800"}`}>
      {value}
    </span>
  </div>
);

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
  const [showTermSummary, setShowTermSummary] = useState(false);

  const bs = bufferSummary;
  const totalBufferConcession = bs
    ? Number(bs.annualPrimaryBufferConcession || 0) + Number(bs.annualExtendedBufferConcession || 0)
    : null;
  const termTotalConcession = bs
    ? Number(bs.termPrimaryBufferConcession || 0) + Number(bs.termExtendedBufferConcession || 0)
    : null;
  const hasBuffer = bs && (bs.primaryBufferDays > 0 || bs.extendedBufferDays > 0);
  const hasTerm = bs && bs.termGrossRent != null && bs.termGrossRent > 0;

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
          <Input label="Rate / Sqft / Month" type="number" step="0.01" value={form.rate_per_sqft_monthly} onChange={set("rate_per_sqft_monthly")} />
          <Select label="Billing Frequency" value={form.billing_frequency} onChange={set("billing_frequency")} options={BILLING_FREQ_OPTIONS} />
          <Select label="Payment Due" value={form.payment_due_date} onChange={set("payment_due_date")} options={PAYMENT_DUE_OPTIONS} />
          <Input label="First Rent Due Date" type="date" value={form.first_rent_due_date} onChange={set("first_rent_due_date")} />
          <Input label="Currency" value={form.currency} onChange={set("currency")} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {effectiveBaseRentMonthly !== null
            ? `Monthly Rent auto-derived: Rate (${formatINR2(form.rate_per_sqft_monthly)}/sqft) \u00D7 Area (${Number(totalAllocatedAreaSqft || 0).toLocaleString("en-IN")} sqft) = ${formatINR(effectiveBaseRentMonthly)}`
            : "Set Rate / Sqft and allocate area to auto-calculate rent."}
        </p>
      </div>

      {/* Buffer Settings */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Buffer & Rent-Free Period</h4>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Primary buffer = 0% charge (fully rent-free). Extended buffer = partial charge. Proration uses actual calendar days per month.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Primary Buffer Days (0% rent)" type="number" value={form.rent_free_days} onChange={set("rent_free_days")} min="0" placeholder="e.g. 75" />
          <Input label="Extended Buffer Days (partial %)" type="number" value={form.extended_buffer_days} onChange={set("extended_buffer_days")} min="0" />
          <Input label="Extended Buffer Charge %" type="number" step="0.01" value={form.extended_buffer_charge_percent} onChange={set("extended_buffer_charge_percent")} min="0" max="100" placeholder="50" />
        </div>
      </div>

      {/* ─── FINANCIAL DASHBOARD ─── */}
      {(displayedBaseRentMonthly || bs) && (
        <div className="space-y-4">
          {/* Stat Widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={IndianRupee}
              label="Quoted Rate"
              value={form.rate_per_sqft_monthly ? `${formatINR(form.rate_per_sqft_monthly)}/sqft` : null}
              sub="per month"
              bg="bg-blue-50"
              text="text-blue-600"
            />
            <StatCard
              icon={IndianRupee}
              label="Monthly Rent"
              value={formatINR(displayedBaseRentMonthly)}
              sub="base rent (gross)"
              bg="bg-emerald-50"
              text="text-emerald-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Annual Gross"
              value={formatINR(annualRent)}
              sub="12 months"
              bg="bg-amber-50"
              text="text-amber-600"
            />
            <StatCard
              icon={Maximize2}
              label="Allocated Area"
              value={totalAllocatedAreaSqft ? `${Number(totalAllocatedAreaSqft).toLocaleString("en-IN")} sqft` : null}
              sub="leasable area"
              bg="bg-purple-50"
              text="text-purple-600"
            />
          </div>

          {/* Buffer Breakdown */}
          {hasBuffer && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-700">Buffer Breakdown</h4>
              </div>

              {/* Timeline dates */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {bs.primaryBufferStartDate && (
                  <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">
                    Rent-Free Start: {bs.primaryBufferStartDate}
                  </span>
                )}
                {bs.primaryBufferEndDate && (
                  <>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">
                      Rent-Free End: {bs.primaryBufferEndDate}
                    </span>
                  </>
                )}
                {bs.firstChargeDate && (
                  <>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                      First Charge: {bs.firstChargeDate}
                    </span>
                  </>
                )}
                {bs.fullChargeDate && (
                  <>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                      Full Charge: {bs.fullChargeDate}
                    </span>
                  </>
                )}
              </div>

              {/* Buffer rows */}
              <div className="space-y-2">
                {bs.primaryBufferDays > 0 && (
                  <div className="flex items-center justify-between bg-red-50/50 rounded-lg px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Primary Buffer</p>
                      <p className="text-xs text-gray-500">{bs.primaryBufferDays} days @ 0% charge (fully rent-free)</p>
                    </div>
                    <p className="text-sm font-semibold text-red-600">
                      {formatINR(bs.annualPrimaryBufferConcession)} concession
                    </p>
                  </div>
                )}
                {bs.extendedBufferDays > 0 && (
                  <div className="flex items-center justify-between bg-amber-50/50 rounded-lg px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Extended Buffer</p>
                      <p className="text-xs text-gray-500">{bs.extendedBufferDays} days @ {bs.extendedBufferChargePercent}% charge</p>
                    </div>
                    <p className="text-sm font-semibold text-amber-600">
                      {formatINR(bs.annualExtendedBufferConcession)} concession
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2.5">
                  <p className="text-sm font-semibold text-gray-700">Total Buffer Concession</p>
                  <p className="text-sm font-bold text-red-700">{formatINR(totalBufferConcession)}</p>
                </div>
              </div>

              {/* Per-Day Rent Breakdown */}
              <div className="mt-4 space-y-3">
                <p className="text-xs font-medium text-gray-600">Per-Day Rent Breakdown</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Commencement partial month */}
                  <div className="bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Commencement Month (Gross)</p>
                    <p className="text-lg font-bold text-gray-800">{formatINR2(bs.currentDailyBaseRent)}<span className="text-xs font-normal text-gray-500">/day</span></p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatINR(displayedBaseRentMonthly)} ÷ {bs.commencementMonthDays} days
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">{bs.commencementRemainingDays} days</span> remaining
                      </p>
                      <p className="text-sm font-semibold text-gray-800">{formatINR2(bs.commencementPartialRent)}</p>
                      <p className="text-[10px] text-gray-400">{formatINR2(bs.currentDailyBaseRent)} × {bs.commencementRemainingDays} days</p>
                    </div>
                  </div>

                  {/* First charge month */}
                  <div className="bg-amber-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">First Charge Month</p>
                    <p className="text-lg font-bold text-amber-700">{formatINR2(bs.firstChargeDailyRate)}<span className="text-xs font-normal text-gray-500">/day</span></p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatINR(displayedBaseRentMonthly)} ÷ {bs.firstChargeMonthDays} days
                    </p>
                    <div className="mt-2 pt-2 border-t border-amber-200">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">{bs.firstChargeRemainingDays} days</span> billable
                      </p>
                      <p className="text-sm font-semibold text-amber-800">{formatINR2(bs.firstInvoiceAmount)}</p>
                      <p className="text-[10px] text-gray-400">First invoice (from {bs.firstChargeDate})</p>
                    </div>
                  </div>

                  {/* Next full month + effective average */}
                  <div className="bg-emerald-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Next Full Month</p>
                    <p className="text-lg font-bold text-emerald-700">{formatINR2(bs.nextFullMonthDailyRate)}<span className="text-xs font-normal text-gray-500">/day</span></p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatINR(displayedBaseRentMonthly)} ÷ {bs.nextFullMonthDays} days
                    </p>
                    <div className="mt-2 pt-2 border-t border-emerald-200">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">{bs.nextFullMonthDays} days</span> full cycle
                      </p>
                      <p className="text-sm font-semibold text-emerald-800">{formatINR2(bs.nextCycleAmount)}</p>
                      <p className="text-[10px] text-gray-400">Full month invoice</p>
                    </div>
                  </div>
                </div>

                {/* Effective average per-day */}
                {bs.annualNetCollectible > 0 && (
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2.5">
                    <p className="text-sm text-gray-600">Effective Avg Per-Day (Year 1, after buffer)</p>
                    <p className="text-sm font-bold text-gray-800 ml-auto">{formatINR2(bs.annualNetCollectible / 365)}/day</p>
                  </div>
                )}

                <p className="text-[10px] text-gray-400">
                  Per-day rent = Monthly Rent ÷ actual calendar days in that month. Each month has a different daily rate.
                </p>
              </div>
            </div>
          )}

          {/* First Year Net Summary */}
          {bs && bs.annualGrossRent != null && (
            <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-emerald-800">First Year Summary</h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Calculation breakdown */}
                <div className="space-y-0.5">
                  <SummaryRow label="Annual Gross Rent" value={formatINR(bs.annualGrossRent)} />
                  {bs.annualPrimaryBufferConcession > 0 && (
                    <SummaryRow label={`Primary Buffer (${bs.primaryBufferDays} days)`} value={formatINR(bs.annualPrimaryBufferConcession)} negative />
                  )}
                  {bs.annualExtendedBufferConcession > 0 && (
                    <SummaryRow label={`Extended Buffer (${bs.extendedBufferDays} days)`} value={formatINR(bs.annualExtendedBufferConcession)} negative />
                  )}
                  <div className="border-t border-emerald-300 my-1" />
                  <SummaryRow label="First Year Net Collectible" value={formatINR(bs.annualNetCollectible)} bold />
                </div>

                {/* Right: Effective rates */}
                <div className="bg-white/70 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Effective Monthly Rent (Year 1)</p>
                    <p className="text-lg font-bold text-gray-800">{formatINR(bs.effectiveMonthlyRent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Effective Rate / Sqft (Year 1)</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-gray-800">
                        {bs.effectiveRatePerSqft != null ? `${formatINR(bs.effectiveRatePerSqft)}/sqft` : "\u2014"}
                      </p>
                      {form.rate_per_sqft_monthly && bs.effectiveRatePerSqft != null && (
                        <span className="text-xs text-gray-400">
                          vs Quoted: {formatINR(form.rate_per_sqft_monthly)}/sqft
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Per-Day Rent (Commencement Month)</p>
                    <p className="text-sm font-semibold text-gray-700">{formatINR2(bs.currentDailyBaseRent)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Term Summary (collapsible) */}
          {hasTerm && (
            <div className="bg-white border border-gray-200 rounded-xl">
              <button
                type="button"
                onClick={() => setShowTermSummary((p) => !p)}
                className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <span>Full Term Summary</span>
                {showTermSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showTermSummary && (
                <div className="px-5 pb-4 space-y-0.5">
                  <SummaryRow label="Term Gross Rent" value={formatINR(bs.termGrossRent)} />
                  {bs.termPrimaryBufferConcession > 0 && (
                    <SummaryRow label="Primary Buffer Concession" value={formatINR(bs.termPrimaryBufferConcession)} negative />
                  )}
                  {bs.termExtendedBufferConcession > 0 && (
                    <SummaryRow label="Extended Buffer Concession" value={formatINR(bs.termExtendedBufferConcession)} negative />
                  )}
                  <div className="border-t border-gray-200 my-1" />
                  <SummaryRow label="Term Net Collectible" value={formatINR(bs.termNetCollectible)} bold />
                  <SummaryRow label="Total Concession (Term)" value={formatINR(termTotalConcession)} negative />
                </div>
              )}
            </div>
          )}

          {/* Invoice Preview */}
          {bs && (bs.firstInvoiceAmount > 0 || bs.nextCycleAmount > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-medium text-gray-500">First Invoice</p>
                </div>
                <p className="text-xl font-bold text-gray-800">{formatINR2(bs.firstInvoiceAmount)}</p>
                <p className="text-[10px] text-gray-400 mt-1">Partial month from first charge date</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-medium text-gray-500">Next Full Cycle</p>
                </div>
                <p className="text-xl font-bold text-gray-800">{formatINR2(bs.nextCycleAmount)}</p>
                <p className="text-[10px] text-gray-400 mt-1">Full month invoice amount</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Escalation */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Escalation</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Template" value={form.escalation_template} onChange={set("escalation_template")} options={templateOptions} />
          <Select label="Escalation Type" value={form.escalation_type} onChange={set("escalation_type")} options={ESCALATION_TYPE_OPTIONS} disabled={isTemplateDrivenEscalation} />
          <Input label="Escalation Value" type="number" step="0.01" value={form.escalation_value} onChange={set("escalation_value")} readOnly={isTemplateDrivenEscalation} />
          <Input label="Frequency (Months)" type="number" value={form.escalation_frequency_months} onChange={set("escalation_frequency_months")} readOnly={isTemplateDrivenEscalation} />
          <Input label="First Escalation (Months)" type="number" value={form.first_escalation_months} onChange={set("first_escalation_months")} readOnly={isTemplateDrivenEscalation} />
        </div>
        {isTemplateDrivenEscalation && (
          <p className="text-xs text-gray-500 mt-2">Escalation values are auto-filled from the selected template.</p>
        )}
        <div className="flex gap-5 mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.apply_to_cam} onChange={toggle("apply_to_cam")} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" disabled={isTemplateDrivenEscalation} />
            Apply to CAM
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.apply_to_parking} onChange={toggle("apply_to_parking")} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" disabled={isTemplateDrivenEscalation} />
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
