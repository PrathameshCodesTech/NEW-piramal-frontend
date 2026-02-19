import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FileText,
  RefreshCw,
  FileX,
  Building2,
  Shield,
  Scale,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { clausesAPI, clauseCategoriesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import AddRenewalCycleModal from "./AddRenewalCycleModal";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
];
const APPLIES_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "RESIDENTIAL", label: "Residential" },
];
const DISPUTE_MECHANISM_OPTIONS = [
  { value: "Arbitration", label: "Arbitration" },
  { value: "Mediation", label: "Mediation" },
  { value: "Litigation", label: "Litigation" },
  { value: "Negotiation", label: "Negotiation" },
];
const GOVERNING_LAW_OPTIONS = [
  { value: "State of New York", label: "State of New York" },
  { value: "State of California", label: "State of California" },
  { value: "State of Texas", label: "State of Texas" },
  { value: "State of Florida", label: "State of Florida" },
  { value: "Federal Law", label: "Federal Law" },
  { value: "India", label: "India" },
];

const parseCycleFromTermLabel = (termLabel) => {
  const yearsMatch = String(termLabel || "").match(/(\d+)\s*year/i);
  const monthsMatch = String(termLabel || "").match(/(\d+)\s*month/i);
  const years = yearsMatch ? Number(yearsMatch[1]) : 0;
  const months = monthsMatch ? Number(monthsMatch[1]) : 0;
  return {
    years: Number.isFinite(years) ? years : 0,
    months: Number.isFinite(months) ? Math.min(11, Math.max(0, months)) : 0,
  };
};

const formatCycleTerm = (cycle) => {
  if (cycle?.term) return cycle.term;
  const years = Number(cycle?.termYears ?? cycle?.term_years ?? 0);
  const months = Number(cycle?.termMonths ?? cycle?.term_months ?? 0);
  return `${years} year${years === 1 ? "" : "s"}${months > 0 ? ` ${months} month${months === 1 ? "" : "s"}` : ""}`;
};

const initialConfigForm = {
  preRenewalWindow: "90",
  renewalCycles: [],
  terminationByTenant: false,
  terminationByLandlord: false,
  subLettingPermitted: false,
  tenantSignage: true,
  landlordApproval: true,
  maxSignageArea: "5",
  signageUnit: "sqm",
  signageNotes: "",
  exclusiveUse: false,
  exclusiveCategory: "",
  excludedCategories: [],
  nonCompeteDuration: "6",
  nonCompeteNotes: "",
  tenantRestore: true,
  reinstatementDetails: "",
  tenantInsurance: true,
  coverageAmount: "5000000",
  additionalInsurance: false,
  indemnityNotes: "",
  disputeMechanism: "Arbitration",
  governingLaw: "State of New York",
  disputeSummary: "",
};

export default function ClauseCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddCycleModal, setShowAddCycleModal] = useState(false);
  const [newExcludedCategory, setNewExcludedCategory] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "",
    applies_to: "ALL",
    status: "DRAFT",
    initial_body_text: "",
    initial_change_summary: "Initial version",
  });

  const [configForm, setConfigForm] = useState(initialConfigForm);

  useEffect(() => {
    clauseCategoriesAPI.list().then((r) => setCategories(r?.results || r || [])).catch(() => {});
  }, []);

  const setFormField = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));
  const setConfigField = (field, value) =>
    setConfigForm((p) => ({ ...p, [field]: value }));

  const buildInitialConfig = () => {
    const cycles = (configForm.renewalCycles || []).map((x) => ({
      ...(() => {
        const yearsFromField = Number(x.termYears);
        const monthsFromField = Number(x.termMonths);
        if (Number.isFinite(yearsFromField) || Number.isFinite(monthsFromField)) {
          return {
            term_years: Number.isFinite(yearsFromField) ? Math.max(0, yearsFromField) : 0,
            term_months: Number.isFinite(monthsFromField) ? Math.min(11, Math.max(0, monthsFromField)) : 0,
          };
        }
        const parsed = parseCycleFromTermLabel(x.term);
        return { term_years: parsed.years, term_months: parsed.months };
      })(),
      rent_formula: x.rentFormula || x.rent_formula || "",
      comments: x.comments || "",
    }));
    return {
      renewal: {
        pre_negotiation_days: Number(configForm.preRenewalWindow || 0),
        cycles,
      },
      termination: {
        tenant_permitted: !!configForm.terminationByTenant,
        landlord_permitted: !!configForm.terminationByLandlord,
      },
      subletting: { permitted: !!configForm.subLettingPermitted },
      signage: {
        entitled: !!configForm.tenantSignage,
        requires_landlord_approval: !!configForm.landlordApproval,
        max_area_sqm: Number(configForm.maxSignageArea || 0),
        signage_area_unit: configForm.signageUnit?.toUpperCase() === "SQFT" ? "SQFT" : "SQM",
        notes: configForm.signageNotes || "",
      },
      exclusivity: {
        exclusive_use: !!configForm.exclusiveUse,
        exclusive_category_description: configForm.exclusiveCategory || "",
        excluded_categories: Array.isArray(configForm.excludedCategories)
          ? configForm.excludedCategories
          : [],
        non_compete_months: Number(configForm.nonCompeteDuration || 0),
        non_compete_scope_notes: configForm.nonCompeteNotes || "",
      },
      reinstatement: {
        restore_required: !!configForm.tenantRestore,
        details: configForm.reinstatementDetails || "",
      },
      insurance: {
        public_liability_required: !!configForm.tenantInsurance,
        min_coverage_amount: Number(configForm.coverageAmount || 0),
        additional_requirements: configForm.additionalInsurance ? "Yes" : "",
        indemnity_notes: configForm.indemnityNotes || "",
      },
      dispute: {
        mechanism: configForm.disputeMechanism || "",
        governing_law: configForm.governingLaw || "",
        summary: configForm.disputeSummary || "",
      },
    };
  };

  const handleAddRenewalCycle = (cycle) => {
    const years = Number(cycle.termYears ?? cycle.term_years ?? 0);
    const months = Number(cycle.termMonths ?? cycle.term_months ?? 0);
    const normalizedYears = Number.isFinite(years) ? Math.max(0, years) : 0;
    const normalizedMonths = Number.isFinite(months) ? Math.min(11, Math.max(0, months)) : 0;
    const normalizedFormula = cycle.rentFormula || cycle.rent_formula || "";
    setConfigForm((p) => ({
      ...p,
      renewalCycles: [
        ...(p.renewalCycles || []),
        {
          ...cycle,
          cycle: (p.renewalCycles?.length || 0) + 1,
          termYears: normalizedYears,
          termMonths: normalizedMonths,
          term_years: normalizedYears,
          term_months: normalizedMonths,
          rentFormula: normalizedFormula,
          rent_formula: normalizedFormula,
          term: formatCycleTerm({ termYears: normalizedYears, termMonths: normalizedMonths }),
        },
      ],
    }));
    setShowAddCycleModal(false);
  };

  const handleRemoveRenewalCycle = (index) => {
    setConfigForm((p) => ({
      ...p,
      renewalCycles: (p.renewalCycles || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddExcludedCategory = () => {
    if (newExcludedCategory.trim() && !configForm.excludedCategories.includes(newExcludedCategory.trim())) {
      setConfigForm((p) => ({
        ...p,
        excludedCategories: [...p.excludedCategories, newExcludedCategory.trim()],
      }));
      setNewExcludedCategory("");
    }
  };

  const handleRemoveExcludedCategory = (cat) => {
    setConfigForm((p) => ({
      ...p,
      excludedCategories: p.excludedCategories.filter((c) => c !== cat),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.category) {
      toast.error("Category is required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: parseInt(form.category, 10),
        applies_to: form.applies_to,
        status: form.status,
        initial_body_text: form.initial_body_text || "",
        initial_change_summary: form.initial_change_summary || "Initial version",
        initial_config: buildInitialConfig(),
      };
      const res = await clausesAPI.create(payload);
      toast.success("Clause created");
      navigate(`/clauses/clauses/${res.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  const sectionClass = "border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg";
  const sectionClassAlt = "border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg";

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Details */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Clause Details</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <Input
              label="Title"
              value={form.title}
              onChange={setFormField("title")}
              required
            />
          </div>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={categoryOptions}
            required
          />
          <Select
            label="Applies To"
            value={form.applies_to}
            onChange={(e) => setForm({ ...form, applies_to: e.target.value })}
            options={APPLIES_OPTIONS}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="mt-4">
          <Input
            label="Change Summary"
            value={form.initial_change_summary}
            onChange={setFormField("initial_change_summary")}
            placeholder="Initial version"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Clause Body</label>
          <textarea
            value={form.initial_body_text}
            onChange={setFormField("initial_body_text")}
            rows={6}
            placeholder="Enter the clause text..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
          />
        </div>
      </div>

      {/* Renewal Options */}
      <div className={sectionClassAlt}>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Renewal Options</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">Configure terms for automatic or optional lease renewals.</p>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              label="Pre-Renewal Negotiation Window"
              type="number"
              value={configForm.preRenewalWindow}
              onChange={(e) => setConfigField("preRenewalWindow", e.target.value)}
              className="max-w-[120px]"
            />
            <span className="text-sm text-gray-600 mt-6">Days before lease expiry to start negotiation</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Renewal Cycles</label>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Cycle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Term</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Rent Formula</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Comments</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(configForm.renewalCycles || []).map((cycle, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{cycle.cycle}</td>
                      <td className="px-4 py-3 text-sm">{formatCycleTerm(cycle)}</td>
                      <td className="px-4 py-3 text-sm">{cycle.rentFormula || cycle.rent_formula}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cycle.comments}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveRenewalCycle(idx)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              type="button"
              variant="secondary"
              icon={Plus}
              onClick={() => setShowAddCycleModal(true)}
              className="mt-2"
            >
              Add Renewal Cycle
            </Button>
          </div>
        </div>
      </div>

      {/* Termination & Early Exit */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <FileX className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Termination & Early Exit</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">Define terms for lease termination by either party.</p>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={configForm.terminationByTenant}
              onChange={(e) => setConfigField("terminationByTenant", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Termination by Tenant Permitted</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={configForm.terminationByLandlord}
              onChange={(e) => setConfigField("terminationByLandlord", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Termination by Landlord Permitted</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-4 italic">
          Note: Standard termination clauses are managed in the Clause Library. Adjustments here override defaults.
        </p>
      </div>

      {/* Sub-letting & Signage Rights */}
      <div className={sectionClassAlt}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Sub-letting & Signage Rights</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">Define tenant&apos;s rights regarding sub-leasing and external signage.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Sub-letting Permitted</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configForm.subLettingPermitted}
                onChange={(e) => setConfigField("subLettingPermitted", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Signage Rights</h5>
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={configForm.tenantSignage}
                onChange={(e) => setConfigField("tenantSignage", e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Tenant is entitled to signage</span>
            </label>
            {configForm.tenantSignage && (
              <div className="ml-7 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Requires Landlord Approval</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configForm.landlordApproval}
                      onChange={(e) => setConfigField("landlordApproval", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    label="Maximum Signage Area"
                    type="number"
                    value={configForm.maxSignageArea}
                    onChange={(e) => setConfigField("maxSignageArea", e.target.value)}
                    className="max-w-[120px]"
                  />
                  <select
                    value={configForm.signageUnit}
                    onChange={(e) => setConfigField("signageUnit", e.target.value)}
                    className="mt-6 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="sqm">sqm</option>
                    <option value="sqft">sqft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Signage Location / Notes</label>
                  <textarea
                    value={configForm.signageNotes}
                    onChange={(e) => setConfigField("signageNotes", e.target.value)}
                    rows={2}
                    placeholder="Main entrance facade, maximum two signs."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exclusivity & Non-Compete */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Exclusivity & Non-Compete</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">Define exclusive rights for the tenant and non-compete clauses.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Exclusive Use</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configForm.exclusiveUse}
                onChange={(e) => setConfigField("exclusiveUse", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
          {configForm.exclusiveUse && (
            <>
              <Input
                label="Exclusive Category Description"
                value={configForm.exclusiveCategory}
                onChange={(e) => setConfigField("exclusiveCategory", e.target.value)}
                placeholder="e.g., Cafe and light food preparation"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Categories</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {configForm.excludedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleRemoveExcludedCategory(cat)}
                        className="hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExcludedCategory}
                    onChange={(e) => setNewExcludedCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExcludedCategory())}
                    placeholder='Add categories landlord cannot allow nearby (e.g., "Cafe", "Hair Salon")'
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddExcludedCategory}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  label="Non-Compete Duration After Lease End"
                  type="number"
                  value={configForm.nonCompeteDuration}
                  onChange={(e) => setConfigField("nonCompeteDuration", e.target.value)}
                  className="max-w-[100px]"
                />
                <span className="text-sm text-gray-600 mt-6">Months</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Non-Compete Scope / Notes</label>
                <textarea
                  value={configForm.nonCompeteNotes}
                  onChange={(e) => setConfigField("nonCompeteNotes", e.target.value)}
                  rows={2}
                  placeholder="Within a 1-mile radius of the property."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reinstatement & Insurance */}
      <div className={sectionClassAlt}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Reinstatement & Insurance</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">Obligations for restoring the unit and insurance requirements.</p>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={configForm.tenantRestore}
              onChange={(e) => setConfigField("tenantRestore", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Tenant must restore unit to original condition</span>
          </label>
          {configForm.tenantRestore && (
            <div className="ml-7">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reinstatement Details</label>
              <textarea
                value={configForm.reinstatementDetails}
                onChange={(e) => setConfigField("reinstatementDetails", e.target.value)}
                rows={2}
                placeholder="Return to original white box condition, patching all holes."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-emerald-50"
              />
              <p className="text-xs text-gray-500 mt-1 italic">
                Note: Security deposit retention for reinstatement costs is typically covered in the general lease terms.
              </p>
            </div>
          )}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={configForm.tenantInsurance}
                onChange={(e) => setConfigField("tenantInsurance", e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">Tenant must carry Public Liability Insurance</span>
            </label>
            {configForm.tenantInsurance && (
              <div className="ml-7 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Coverage Amount</label>
                  <div className="relative max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                    <input
                      type="text"
                      value={configForm.coverageAmount}
                      onChange={(e) => setConfigField("coverageAmount", e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={configForm.additionalInsurance}
                    onChange={(e) => setConfigField("additionalInsurance", e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Additional insurance requirements</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indemnity Notes</label>
                  <textarea
                    value={configForm.indemnityNotes}
                    onChange={(e) => setConfigField("indemnityNotes", e.target.value)}
                    rows={2}
                    placeholder="Tenant indemnifies landlord against all claims arising from tenant's use."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute Resolution */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Dispute Resolution & Governing Law</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">Define how disputes will be resolved and which jurisdiction&apos;s laws apply.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Dispute Resolution Mechanism"
            value={configForm.disputeMechanism}
            onChange={(e) => setConfigField("disputeMechanism", e.target.value)}
            options={DISPUTE_MECHANISM_OPTIONS}
          />
          <Select
            label="Governing Law"
            value={configForm.governingLaw}
            onChange={(e) => setConfigField("governingLaw", e.target.value)}
            options={GOVERNING_LAW_OPTIONS}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary of Dispute Resolution</label>
          <textarea
            value={configForm.disputeSummary}
            onChange={(e) => setConfigField("disputeSummary", e.target.value)}
            rows={3}
            placeholder="Disputes to be resolved via binding arbitration in New York, NY, with a single arbitrator."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" type="button" onClick={() => navigate("/clauses/clauses")}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Clause
        </Button>
      </div>

      {showAddCycleModal && (
        <AddRenewalCycleModal
          onClose={() => setShowAddCycleModal(false)}
          onAdd={handleAddRenewalCycle}
          cycleNumber={(configForm.renewalCycles?.length || 0) + 1}
        />
      )}
    </form>
  );

  const wrappedContent = (
    <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-4xl"}>
      {formContent}
    </Card>
  );

  if (inModal) return wrappedContent;
  return (
    <div>
      <PageHeader title="Create Clause" backTo="/clauses/clauses" />
      {wrappedContent}
    </div>
  );
}
