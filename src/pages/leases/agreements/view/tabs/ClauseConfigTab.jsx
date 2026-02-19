import { useState } from "react";
import {
  RefreshCw, FileX, Building2, Shield, Gavel,
  ChevronDown, ChevronUp,
} from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import Card from "../../../../../components/ui/Card";

// ── Section color map (static — avoids Tailwind purge issues) ──────────────
const COLORS = {
  red:    { hdr: "bg-red-50 border-red-100",     icon: "bg-red-100 text-red-600" },
  blue:   { hdr: "bg-blue-50 border-blue-100",    icon: "bg-blue-100 text-blue-600" },
  purple: { hdr: "bg-purple-50 border-purple-100", icon: "bg-purple-100 text-purple-600" },
  amber:  { hdr: "bg-amber-50 border-amber-100",  icon: "bg-amber-100 text-amber-600" },
  teal:   { hdr: "bg-teal-50 border-teal-100",    icon: "bg-teal-100 text-teal-600" },
  gray:   { hdr: "bg-gray-50 border-gray-100",    icon: "bg-gray-100 text-gray-600" },
};

function SectionCard({ icon: Icon, title, color = "gray", children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = COLORS[color] ?? COLORS.gray;
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-5 py-3 border-b ${c.hdr} transition-colors`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 py-5 space-y-4">{children}</div>}
    </Card>
  );
}

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

function SubLabel({ children }) {
  return <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{children}</p>;
}

function Textarea({ label, value, onChange, rows = 3, placeholder = "" }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <textarea
        rows={rows}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
      />
    </div>
  );
}

// ── Select options ─────────────────────────────────────────────────────────
const PENALTY_OPTIONS = [
  { value: "", label: "None" },
  { value: "MONTHS_RENT", label: "Months of Rent" },
  { value: "FIXED_AMOUNT", label: "Fixed Amount" },
  { value: "PERCENTAGE_REMAINING", label: "% of Remaining Rent" },
  { value: "DEPOSIT_FORFEITURE", label: "Deposit Forfeiture" },
];

const SUBLET_PERM_OPTIONS = [
  { value: "PROHIBITED", label: "Prohibited" },
  { value: "PERMITTED", label: "Permitted" },
  { value: "WITH_APPROVAL", label: "Permitted with Landlord Approval" },
];

const RADIUS_OPTIONS = [
  { value: "Within Property", label: "Within Property" },
  { value: "Floor", label: "Same Floor" },
  { value: "Building", label: "Entire Building" },
  { value: "Campus", label: "Entire Campus" },
];

const RESTORE_OPTIONS = [
  { value: "ORIGINAL", label: "Original Condition" },
  { value: "BROOM_CLEAN", label: "Broom Clean" },
  { value: "AS_IS", label: "As-Is" },
  { value: "IMPROVED", label: "Improved Condition" },
];

const DISPUTE_OPTIONS = [
  { value: "MEDIATION", label: "Mediation" },
  { value: "ARBITRATION", label: "Arbitration" },
  { value: "LITIGATION", label: "Litigation" },
  { value: "MED_ARB", label: "Mediation then Arbitration" },
  { value: "NEGOTIATION", label: "Negotiation" },
];

const AREA_UNIT_OPTIONS = [
  { value: "SQFT", label: "sq ft" },
  { value: "SQM", label: "sq m" },
];

// ── Main component ─────────────────────────────────────────────────────────

export default function ClauseConfigTab({ loading, form, setForm, onSubmit, saving }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Helper: partial-update a top-level section key
  const sec = (key) => (updates) =>
    setForm((p) => ({ ...p, [key]: { ...p[key], ...updates } }));

  const t   = form.termination          || {};
  const r   = form.renewal_option       || {};
  const ss  = form.sublet_signage       || {};
  const ex  = form.exclusivity          || {};
  const ins = form.insurance_requirement || {};
  const dr  = form.dispute_resolution   || {};

  const setT   = sec("termination");
  const setR   = sec("renewal_option");
  const setSS  = sec("sublet_signage");
  const setEx  = sec("exclusivity");
  const setIns = sec("insurance_requirement");
  const setDR  = sec("dispute_resolution");

  const hasPenaltyValue = (type) => type && type !== "DEPOSIT_FORFEITURE";

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">

      {/* ── 1. Termination ── */}
      <SectionCard icon={FileX} title="Termination & Early Exit" color="red">

        <SubLabel>Tenant Early Exit</SubLabel>
        <Toggle
          label="Tenant early exit permitted"
          checked={t.tenant_early_exit_permitted}
          onChange={(e) => setT({ tenant_early_exit_permitted: e.target.checked })}
        />
        {t.tenant_early_exit_permitted && (
          <div className="ml-[52px] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Notice Period (days)"
              type="number"
              value={t.tenant_notice_days ?? ""}
              onChange={(e) => setT({ tenant_notice_days: e.target.value })}
            />
            <Select
              label="Penalty Type"
              value={t.tenant_penalty_type || ""}
              onChange={(e) => setT({ tenant_penalty_type: e.target.value })}
              options={PENALTY_OPTIONS}
            />
            {hasPenaltyValue(t.tenant_penalty_type) && (
              <Input
                label="Penalty Value"
                type="number"
                value={t.tenant_penalty_value ?? ""}
                onChange={(e) => setT({ tenant_penalty_value: e.target.value })}
              />
            )}
            <div className="sm:col-span-2">
              <Textarea
                label="Exit Conditions"
                value={t.tenant_exit_conditions}
                onChange={(e) => setT({ tenant_exit_conditions: e.target.value })}
                rows={2}
                placeholder="Conditions under which the tenant may exit early..."
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 space-y-3">
          <SubLabel>Landlord Early Termination</SubLabel>
          <Toggle
            label="Landlord early termination permitted"
            checked={t.landlord_early_termination_permitted}
            onChange={(e) => setT({ landlord_early_termination_permitted: e.target.checked })}
          />
          {t.landlord_early_termination_permitted && (
            <div className="ml-[52px] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Notice Period (days)"
                type="number"
                value={t.landlord_notice_days ?? ""}
                onChange={(e) => setT({ landlord_notice_days: e.target.value })}
              />
              <Select
                label="Compensation Type"
                value={t.landlord_compensation_type || ""}
                onChange={(e) => setT({ landlord_compensation_type: e.target.value })}
                options={PENALTY_OPTIONS}
              />
              {hasPenaltyValue(t.landlord_compensation_type) && (
                <Input
                  label="Compensation Value"
                  type="number"
                  value={t.landlord_compensation_value ?? ""}
                  onChange={(e) => setT({ landlord_compensation_value: e.target.value })}
                />
              )}
              <Toggle
                label="Relocation assistance provided"
                checked={t.landlord_relocation_assistance}
                onChange={(e) => setT({ landlord_relocation_assistance: e.target.checked })}
              />
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-3">
          <SubLabel>Break Clause</SubLabel>
          <Toggle
            label="Break clause enabled"
            hint="Allows either party to exit at a pre-defined date"
            checked={t.break_clause_enabled}
            onChange={(e) => setT({ break_clause_enabled: e.target.checked })}
          />
          {t.break_clause_enabled && (
            <div className="ml-[52px] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Break Date"
                type="date"
                value={t.break_date || ""}
                onChange={(e) => setT({ break_date: e.target.value })}
              />
              <Input
                label="Break Notice (days)"
                type="number"
                value={t.break_notice_days ?? ""}
                onChange={(e) => setT({ break_notice_days: e.target.value })}
              />
              <Select
                label="Break Penalty Type"
                value={t.break_penalty_type || ""}
                onChange={(e) => setT({ break_penalty_type: e.target.value })}
                options={PENALTY_OPTIONS}
              />
              {hasPenaltyValue(t.break_penalty_type) && (
                <Input
                  label="Break Penalty Value"
                  type="number"
                  value={t.break_penalty ?? ""}
                  onChange={(e) => setT({ break_penalty: e.target.value })}
                />
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Cure Period — Termination for Cause (days)"
            type="number"
            value={t.cure_period_days ?? ""}
            onChange={(e) => setT({ cure_period_days: e.target.value })}
          />
        </div>
        <Textarea
          label="Termination Clause Text"
          value={t.termination_clause}
          onChange={(e) => setT({ termination_clause: e.target.value })}
          rows={4}
          placeholder="Full termination clause language..."
        />
      </SectionCard>

      {/* ── 2. Renewal Option ── */}
      <SectionCard icon={RefreshCw} title="Renewal Option" color="blue">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Pre-Renewal Notice (days)"
            type="number"
            value={r.pre_renewal_notice_days ?? ""}
            onChange={(e) => setR({ pre_renewal_notice_days: e.target.value })}
          />
          <Input
            label="Max Renewal Cycles"
            type="number"
            value={r.max_renewal_cycles ?? ""}
            onChange={(e) => setR({ max_renewal_cycles: e.target.value })}
          />
        </div>
        <Toggle
          label="Auto-renewal enabled"
          hint="Lease renews automatically unless notice is given before the deadline"
          checked={r.auto_renewal_enabled}
          onChange={(e) => setR({ auto_renewal_enabled: e.target.checked })}
        />
        {r.auto_renewal_enabled && (
          <div className="ml-[52px]">
            <Input
              label="Auto-Renewal Term (months)"
              type="number"
              value={r.auto_renewal_term_months ?? ""}
              onChange={(e) => setR({ auto_renewal_term_months: e.target.value })}
            />
          </div>
        )}
        <Textarea
          label="Renewal Notes"
          value={r.renewal_notes}
          onChange={(e) => setR({ renewal_notes: e.target.value })}
          rows={3}
          placeholder="Additional renewal terms or conditions..."
        />
      </SectionCard>

      {/* ── 3. Sub-letting & Signage ── */}
      <SectionCard icon={Building2} title="Sub-letting & Signage" color="purple">
        <SubLabel>Sub-letting</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Sub-letting Permission"
            value={ss.sublet_permission || "PROHIBITED"}
            onChange={(e) => setSS({ sublet_permission: e.target.value })}
            options={SUBLET_PERM_OPTIONS}
          />
          {ss.sublet_permission !== "PROHIBITED" && (
            <Input
              label="Max Sub-let Area (%)"
              type="number"
              value={ss.max_sublet_percentage ?? ""}
              onChange={(e) => setSS({ max_sublet_percentage: e.target.value })}
              placeholder="e.g. 50"
            />
          )}
        </div>
        {ss.sublet_permission !== "PROHIBITED" && (
          <Textarea
            label="Sub-letting Restrictions"
            value={ss.sublet_restrictions}
            onChange={(e) => setSS({ sublet_restrictions: e.target.value })}
            rows={2}
            placeholder="No sub-letting to competitors, must notify within 30 days..."
          />
        )}

        <div className="pt-3 border-t border-gray-100 space-y-3">
          <SubLabel>Signage</SubLabel>
          <Toggle
            label="Signage permitted"
            checked={ss.signage_permitted}
            onChange={(e) => setSS({ signage_permitted: e.target.checked })}
          />
          {ss.signage_permitted && (
            <>
              <Toggle
                label="Landlord approval required for signage"
                checked={ss.signage_approval_required}
                onChange={(e) => setSS({ signage_approval_required: e.target.checked })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-end gap-2">
                  <Input
                    label="Max Signage Area"
                    type="number"
                    value={ss.signage_area_sqft ?? ""}
                    onChange={(e) => setSS({ signage_area_sqft: e.target.value })}
                  />
                  <Select
                    label=" "
                    value={ss.signage_area_unit || "SQFT"}
                    onChange={(e) => setSS({ signage_area_unit: e.target.value })}
                    options={AREA_UNIT_OPTIONS}
                  />
                </div>
                <Input
                  label="Cost Responsibility"
                  value={ss.signage_cost_responsibility || ""}
                  onChange={(e) => setSS({ signage_cost_responsibility: e.target.value })}
                  placeholder="Tenant"
                />
              </div>
              <Textarea
                label="Permitted Signage Locations"
                value={ss.signage_locations}
                onChange={(e) => setSS({ signage_locations: e.target.value })}
                rows={2}
                placeholder="Main entrance facade, lobby directory..."
              />
            </>
          )}
        </div>
      </SectionCard>

      {/* ── 4. Exclusivity & Non-Compete ── */}
      <SectionCard icon={Shield} title="Exclusivity & Non-Compete" color="amber">
        <Toggle
          label="Exclusive use granted"
          hint="Landlord agrees not to lease nearby space to a direct competitor"
          checked={ex.exclusive_use_granted}
          onChange={(e) => setEx({ exclusive_use_granted: e.target.checked })}
        />
        {ex.exclusive_use_granted && (
          <div className="ml-[52px] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Exclusive Category"
              value={ex.exclusive_category || ""}
              onChange={(e) => setEx({ exclusive_category: e.target.value })}
              placeholder="e.g. Café and light food service"
            />
            <Select
              label="Exclusivity Radius"
              value={ex.exclusive_radius || "Within Property"}
              onChange={(e) => setEx({ exclusive_radius: e.target.value })}
              options={RADIUS_OPTIONS}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Exceptions to Exclusivity"
                value={ex.exclusive_exceptions}
                onChange={(e) => setEx({ exclusive_exceptions: e.target.value })}
                rows={2}
                placeholder="Existing tenants, food courts, vending machines..."
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 space-y-3">
          <Toggle
            label="Non-compete clause enabled"
            checked={ex.non_compete_enabled}
            onChange={(e) => setEx({ non_compete_enabled: e.target.checked })}
          />
          {ex.non_compete_enabled && (
            <div className="ml-[52px] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Duration After Lease End (months)"
                type="number"
                value={ex.non_compete_duration_months ?? ""}
                onChange={(e) => setEx({ non_compete_duration_months: e.target.value })}
              />
              <Input
                label="Radius (km)"
                type="number"
                value={ex.non_compete_radius_km ?? ""}
                onChange={(e) => setEx({ non_compete_radius_km: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Non-Compete Scope"
                  value={ex.non_compete_scope}
                  onChange={(e) => setEx({ non_compete_scope: e.target.value })}
                  rows={2}
                  placeholder="Scope and business categories covered by the non-compete..."
                />
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── 5. Insurance & Reinstatement ── */}
      <SectionCard icon={Shield} title="Insurance & Reinstatement" color="teal">
        <SubLabel>Reinstatement on Exit</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Required Exit Condition"
            value={ins.restore_condition || "ORIGINAL"}
            onChange={(e) => setIns({ restore_condition: e.target.value })}
            options={RESTORE_OPTIONS}
          />
          <Input
            label="Reinstatement Timeline (days)"
            type="number"
            value={ins.reinstatement_timeline_days ?? ""}
            onChange={(e) => setIns({ reinstatement_timeline_days: e.target.value })}
          />
        </div>
        <Textarea
          label="Reinstatement Details"
          value={ins.restore_details}
          onChange={(e) => setIns({ restore_details: e.target.value })}
          rows={2}
          placeholder="Return to original white-box condition, patch all holes..."
        />

        <div className="pt-3 border-t border-gray-100 space-y-3">
          <SubLabel>Insurance Requirements</SubLabel>
          <Toggle
            label="Public liability insurance required"
            checked={ins.public_liability_required}
            onChange={(e) => setIns({ public_liability_required: e.target.checked })}
          />
          {ins.public_liability_required && (
            <div className="ml-[52px] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Min Coverage Amount"
                type="number"
                value={ins.public_liability_coverage ?? ""}
                onChange={(e) => setIns({ public_liability_coverage: e.target.value })}
              />
              <Input
                label="Currency"
                value={ins.public_liability_currency || "INR"}
                onChange={(e) => setIns({ public_liability_currency: e.target.value })}
              />
            </div>
          )}
          <Toggle
            label="Property / contents insurance required"
            checked={ins.property_insurance_required}
            onChange={(e) => setIns({ property_insurance_required: e.target.checked })}
          />
          {ins.property_insurance_required && (
            <div className="ml-[52px]">
              <Input
                label="Min Property Coverage Amount"
                type="number"
                value={ins.property_insurance_coverage ?? ""}
                onChange={(e) => setIns({ property_insurance_coverage: e.target.value })}
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Toggle
              label="Landlord named as additional insured"
              checked={ins.landlord_additional_insured}
              onChange={(e) => setIns({ landlord_additional_insured: e.target.checked })}
            />
            <Toggle
              label="Proof of insurance required"
              checked={ins.proof_required}
              onChange={(e) => setIns({ proof_required: e.target.checked })}
            />
            {ins.proof_required && (
              <Input
                label="Proof Frequency"
                value={ins.proof_frequency || "Annual"}
                onChange={(e) => setIns({ proof_frequency: e.target.value })}
                placeholder="Annual"
              />
            )}
          </div>
          <Textarea
            label="Indemnity Notes"
            value={ins.indemnity_notes}
            onChange={(e) => setIns({ indemnity_notes: e.target.value })}
            rows={2}
            placeholder="Tenant indemnifies landlord against all claims arising from tenant's use..."
          />
        </div>
      </SectionCard>

      {/* ── 6. Dispute Resolution ── */}
      <SectionCard icon={Gavel} title="Dispute Resolution & Governing Law" color="gray">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Dispute Mechanism"
            value={dr.dispute_mechanism || "MEDIATION"}
            onChange={(e) => setDR({ dispute_mechanism: e.target.value })}
            options={DISPUTE_OPTIONS}
          />
          <Input
            label="Governing Law (Country)"
            value={dr.governing_law_country || ""}
            onChange={(e) => setDR({ governing_law_country: e.target.value })}
            placeholder="India"
          />
          <Input
            label="Governing Law (State)"
            value={dr.governing_law_state || ""}
            onChange={(e) => setDR({ governing_law_state: e.target.value })}
            placeholder="Maharashtra"
          />
          <Input
            label="Jurisdiction Court"
            value={dr.jurisdiction_court || ""}
            onChange={(e) => setDR({ jurisdiction_court: e.target.value })}
            placeholder="Courts of Mumbai"
          />
        </div>
        <Toggle
          label="Exclusive jurisdiction"
          hint="Disputes must be brought only in the specified court"
          checked={dr.exclusive_jurisdiction}
          onChange={(e) => setDR({ exclusive_jurisdiction: e.target.checked })}
        />

        {(dr.dispute_mechanism === "ARBITRATION" || dr.dispute_mechanism === "MED_ARB") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Arbitration Seat (City)"
              value={dr.arbitration_seat || ""}
              onChange={(e) => setDR({ arbitration_seat: e.target.value })}
              placeholder="Mumbai"
            />
            <Input
              label="Arbitration Language"
              value={dr.arbitration_language || "English"}
              onChange={(e) => setDR({ arbitration_language: e.target.value })}
            />
            <Input
              label="Number of Arbitrators"
              type="number"
              value={dr.number_of_arbitrators ?? ""}
              onChange={(e) => setDR({ number_of_arbitrators: e.target.value })}
            />
            <Input
              label="Arbitration Institution"
              value={dr.arbitration_institution || ""}
              onChange={(e) => setDR({ arbitration_institution: e.target.value })}
              placeholder="ICC, SIAC, DIAC..."
            />
          </div>
        )}

        {(dr.dispute_mechanism === "MEDIATION" || dr.dispute_mechanism === "MED_ARB") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Toggle
              label="Mediation required before further proceedings"
              checked={dr.mediation_required_first}
              onChange={(e) => setDR({ mediation_required_first: e.target.checked })}
            />
            <Input
              label="Mediation Period (days)"
              type="number"
              value={dr.mediation_period_days ?? ""}
              onChange={(e) => setDR({ mediation_period_days: e.target.value })}
            />
          </div>
        )}

        <Textarea
          label="Dispute Resolution Summary"
          value={dr.dispute_summary}
          onChange={(e) => setDR({ dispute_summary: e.target.value })}
          rows={3}
          placeholder="Disputes to be resolved by arbitration in Mumbai under the Indian Arbitration Act..."
        />
      </SectionCard>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={saving}>
          Save Legal Config
        </Button>
      </div>
    </form>
  );
}
