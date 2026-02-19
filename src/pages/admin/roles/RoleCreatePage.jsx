import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Shield, Building2, Users, FileCheck, TrendingUp,
  Receipt, CreditCard, LayoutDashboard, GitMerge, FileText,
  Eye, Plus, Pencil, Trash2, ChevronRight, Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { rolesAPI, scopesAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";

// ── Module definitions — what each permission means per module ────────────────

const MODULE_DEFS = [
  {
    key: "PROPERTY",
    label: "Properties",
    icon: Building2,
    color: "emerald",
    desc: "Sites, towers, floors, units & amenity master data",
    perms: {
      can_view: "Browse the property hierarchy, view unit specs & room details",
      can_create: "Add new sites, towers, floors and units",
      can_edit: "Update unit details, amenities and room configurations",
      can_delete: "Remove units and property records",
      can_approve: "Approve property status changes and configurations",
    },
  },
  {
    key: "TENANT",
    label: "Tenant Setup",
    icon: Users,
    color: "blue",
    desc: "Tenant companies, contacts and KYC documents",
    perms: {
      can_view: "View tenant profiles, contacts and KYC submissions",
      can_create: "Add new tenant companies and contacts",
      can_edit: "Update tenant details, preferences and contact info",
      can_delete: "Remove tenant records and contacts",
      can_approve: "Approve or reject KYC submissions",
    },
  },
  {
    key: "LEASE",
    label: "Lease Management",
    icon: FileCheck,
    color: "purple",
    desc: "Agreements, term dates, financials, escalations and amendments",
    perms: {
      can_view: "View lease agreements, financials and clause config",
      can_create: "Draft new lease agreements",
      can_edit: "Edit lease terms, financials and allocated units",
      can_delete: "Cancel or delete draft leases",
      can_approve: "Submit for approval, activate and terminate leases",
    },
  },
  {
    key: "REVENUE",
    label: "Rent Schedule & Revenue",
    icon: TrendingUp,
    color: "amber",
    desc: "Rent schedule lines, revenue recognition and escalations",
    perms: {
      can_view: "View rent schedules and revenue recognition entries",
      can_create: "Generate new rent schedule lines",
      can_edit: "Adjust rent amounts and schedule dates",
      can_delete: "Remove schedule entries",
      can_approve: "Approve revenue recognition postings",
    },
  },
  {
    key: "AR",
    label: "Invoices & AR",
    icon: Receipt,
    color: "orange",
    desc: "Invoices, AR summaries, ageing buckets and billing rules",
    perms: {
      can_view: "View invoices, AR summaries and ageing reports",
      can_create: "Raise new invoices and billing schedules",
      can_edit: "Edit invoice line items and billing rules",
      can_delete: "Void invoices and billing records",
      can_approve: "Approve credit notes and AR adjustments",
    },
  },
  {
    key: "COLLECTIONS",
    label: "Payments & Collections",
    icon: CreditCard,
    color: "teal",
    desc: "Payments, credit notes, disputes and collection follow-ups",
    perms: {
      can_view: "View payment records and credit note details",
      can_create: "Record incoming payments and credit notes",
      can_edit: "Edit payment details and update collection status",
      can_delete: "Remove payment records (reversal)",
      can_approve: "Approve refunds and payment reversals",
    },
  },
  {
    key: "DASHBOARD",
    label: "Dashboard & Analytics",
    icon: LayoutDashboard,
    color: "indigo",
    desc: "KPIs, charts, portfolio map and occupancy analytics",
    perms: {
      can_view: "Access the main dashboard with KPIs and charts",
      can_create: "N/A",
      can_edit: "N/A",
      can_delete: "N/A",
      can_approve: "N/A",
    },
  },
  {
    key: "APPROVALS",
    label: "Approval Matrices",
    icon: GitMerge,
    color: "rose",
    desc: "Approval rules, SLA configs, escalations and workflows",
    perms: {
      can_view: "View approval rules and their approval paths",
      can_create: "Draft new approval rules",
      can_edit: "Update rule conditions, approvers and SLA settings",
      can_delete: "Remove draft approval rules",
      can_approve: "Activate and publish approval rules",
    },
  },
  {
    key: "DOCUMENTS",
    label: "Documents",
    icon: FileText,
    color: "gray",
    desc: "Lease documents, KYC files, clause library and compliance docs",
    perms: {
      can_view: "View and download uploaded documents",
      can_create: "Upload new documents and link to records",
      can_edit: "Update document metadata and version notes",
      can_delete: "Remove document records",
      can_approve: "Approve document submissions for compliance",
    },
  },
];

const PERM_KEYS = ["can_view", "can_create", "can_edit", "can_delete", "can_approve"];
const PERM_LABELS = { can_view: "View", can_create: "Create", can_edit: "Edit", can_delete: "Delete", can_approve: "Approve" };
const PERM_ICONS = { can_view: Eye, can_create: Plus, can_edit: Pencil, can_delete: Trash2, can_approve: Check };

const ICON_COLORS = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  amber: "bg-amber-50 text-amber-600",
  orange: "bg-orange-50 text-orange-600",
  teal: "bg-teal-50 text-teal-600",
  indigo: "bg-indigo-50 text-indigo-600",
  rose: "bg-rose-50 text-rose-600",
  gray: "bg-gray-100 text-gray-600",
};

const defaultModulePerms = () =>
  MODULE_DEFS.map((m) => ({
    module: m.key,
    can_view: false,
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_approve: false,
  }));

// Preset levels
const PRESETS = {
  none:      { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
  read:      { can_view: true,  can_create: false, can_edit: false, can_delete: false, can_approve: false },
  edit:      { can_view: true,  can_create: true,  can_edit: true,  can_delete: false, can_approve: false },
  full:      { can_view: true,  can_create: true,  can_edit: true,  can_delete: true,  can_approve: true  },
};

function getPreset(mp) {
  if (PERM_KEYS.every((k) => mp[k])) return "full";
  if (mp.can_view && mp.can_create && mp.can_edit && !mp.can_delete && !mp.can_approve) return "edit";
  if (mp.can_view && !mp.can_create && !mp.can_edit && !mp.can_delete && !mp.can_approve) return "read";
  if (PERM_KEYS.every((k) => !mp[k])) return "none";
  return "custom";
}

// ── Step bar ──────────────────────────────────────────────────────────────────

function StepBar({ step }) {
  const steps = ["Role Details", "Module Permissions", "Review & Save"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const s = i + 1;
        const done = s < step;
        const active = s === step;
        return (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                done ? "bg-emerald-500 text-white" : active ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : "bg-gray-100 text-gray-400"
              }`}>
                {done ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-sm font-medium ${active ? "text-emerald-700" : done ? "text-gray-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-3" />}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 — Role Details ─────────────────────────────────────────────────────

function Step1({ form, setForm, scopes }) {
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((p) => ({
      ...p,
      name,
      code: p.code || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };
  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Role Name *</label>
        <input
          type="text"
          required
          placeholder="e.g. Property Manager, Lease Executive"
          value={form.name}
          onChange={handleNameChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Code *</label>
        <input
          type="text"
          required
          placeholder="e.g. property-manager"
          value={form.code}
          onChange={set("code")}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">Unique identifier. Lowercase, hyphens only. Auto-generated from name.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Role Type *</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "ADMIN",    label: "Admin",     desc: "Full system access, manage users & settings" },
            { val: "BUSINESS", label: "Business",  desc: "Operations team, day-to-day workflows" },
            { val: "TENANT",   label: "Tenant",    desc: "Tenant-facing portal access only" },
            { val: "READONLY", label: "Read Only", desc: "View-only across all permitted modules" },
          ].map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role_type: t.val }))}
              className={`flex flex-col items-start p-3 border-2 rounded-xl text-left transition-all ${
                form.role_type === t.val ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className={`text-sm font-semibold ${form.role_type === t.val ? "text-emerald-700" : "text-gray-700"}`}>{t.label}</span>
              <span className="text-xs text-gray-400 mt-0.5 leading-tight">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Scope *</label>
        <select
          required
          value={form.scope}
          onChange={set("scope")}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">Select scope</option>
          {scopes.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.scope_type})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea
          rows={2}
          placeholder="What does this role do? Who should have it?"
          value={form.description}
          onChange={set("description")}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div className="border-l-2 border-amber-400 pl-4 space-y-3">
        <p className="text-xs font-semibold text-gray-600">Approval Authority</p>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max lease value this role can approve (₹)</label>
          <input
            type="number"
            placeholder="Leave empty for no limit"
            value={form.approval_cap_amount}
            onChange={set("approval_cap_amount")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            { k: "can_approve_amendments", label: "Can approve amendments" },
            { k: "can_approve_waivers",    label: "Can approve waivers" },
            { k: "can_modify_matrices",    label: "Can modify approval matrices" },
          ].map((item) => (
            <label key={item.k} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[item.k] || false}
                onChange={(e) => setForm((p) => ({ ...p, [item.k]: e.target.checked }))}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-gray-600">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2 — Module Permissions (card-based) ──────────────────────────────────

function ModuleCard({ def, mp, onChange }) {
  const Icon = def.icon;
  const iconClass = ICON_COLORS[def.color] || "bg-gray-100 text-gray-500";
  const preset = getPreset(mp);
  const enabledCount = PERM_KEYS.filter((k) => mp[k]).length;

  const applyPreset = (p) => onChange({ ...mp, ...PRESETS[p] });
  const toggle = (k) => onChange({ ...mp, [k]: !mp[k] });

  return (
    <div className={`bg-white border-2 rounded-xl p-4 transition-all ${enabledCount > 0 ? "border-emerald-200 shadow-sm" : "border-gray-200"}`}>
      {/* Module header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{def.label}</p>
          <p className="text-xs text-gray-400 leading-tight">{def.desc}</p>
        </div>
        {enabledCount > 0 && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 shrink-0">
            {enabledCount} perm{enabledCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Preset quick-apply row */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs text-gray-400 mr-1">Quick:</span>
        {["none", "read", "edit", "full"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => applyPreset(p)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
              preset === p
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
            }`}
          >
            {p === "none" ? "None" : p === "read" ? "Read" : p === "edit" ? "Edit" : "Full"}
          </button>
        ))}
      </div>

      {/* Individual permission toggles */}
      <div className="grid grid-cols-5 gap-1">
        {PERM_KEYS.map((k) => {
          const PIcon = PERM_ICONS[k];
          const on = mp[k];
          const isNA = def.perms[k] === "N/A";
          return (
            <button
              key={k}
              type="button"
              onClick={() => !isNA && toggle(k)}
              disabled={isNA}
              title={def.perms[k]}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all text-center ${
                isNA
                  ? "opacity-20 cursor-not-allowed bg-gray-50 border-gray-100"
                  : on
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-500"
              }`}
            >
              <PIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium leading-none">{PERM_LABELS[k]}</span>
            </button>
          );
        })}
      </div>

      {/* Hover descriptions — show for enabled perms */}
      {enabledCount > 0 && (
        <div className="mt-3 space-y-0.5">
          {PERM_KEYS.filter((k) => mp[k] && def.perms[k] !== "N/A").map((k) => (
            <p key={k} className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
              <span><span className="font-medium text-gray-600">{PERM_LABELS[k]}:</span> {def.perms[k]}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Step2({ modulePerms, setModulePerms }) {
  const updateModule = (i, updated) => {
    setModulePerms((p) => p.map((m, idx) => (idx === i ? updated : m)));
  };

  const applyAll = (preset) => {
    setModulePerms((p) => p.map((m) => ({ ...m, ...PRESETS[preset] })));
  };

  const enabledModules = modulePerms.filter((mp) => PERM_KEYS.some((k) => mp[k])).length;

  return (
    <div>
      {/* Global preset + summary */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">Set permissions for each module</p>
          <p className="text-xs text-gray-400">Hover over each toggle to see what it enables. Use "Quick" presets for fast setup.</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-400 mr-1">Set all:</span>
          {["none", "read", "edit", "full"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyAll(p)}
              className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 font-medium transition-colors"
            >
              {p === "none" ? "None" : p === "read" ? "All Read" : p === "edit" ? "All Edit" : "All Full"}
            </button>
          ))}
        </div>
        {enabledModules > 0 && (
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 shrink-0">
            {enabledModules}/{MODULE_DEFS.length} modules
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {MODULE_DEFS.map((def, i) => (
          <ModuleCard
            key={def.key}
            def={def}
            mp={modulePerms[i]}
            onChange={(updated) => updateModule(i, updated)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Step 3 — Review ───────────────────────────────────────────────────────────

function Step3({ form, modulePerms }) {
  const active = modulePerms.filter((mp) => PERM_KEYS.some((k) => mp[k]));
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-800">{form.name || "—"}</p>
          {form.code && <p className="text-sm font-mono text-gray-500 mt-0.5">Code: {form.code}</p>}
          <p className="text-xs text-gray-500 mt-0.5">
            {form.role_type} role · {active.length} module{active.length !== 1 ? "s" : ""} with access
            {form.approval_cap_amount ? ` · Cap ₹${Number(form.approval_cap_amount).toLocaleString("en-IN")}` : ""}
          </p>
          {form.description && <p className="text-sm text-gray-600 mt-1">{form.description}</p>}
        </div>
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          No module permissions configured. This role will have no access to any module.
        </p>
      ) : (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Module Access Summary</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {active.map((mp) => {
              const def = MODULE_DEFS.find((d) => d.key === mp.module);
              const Icon = def?.icon || Shield;
              const iconClass = ICON_COLORS[def?.color || "gray"];
              const enabled = PERM_KEYS.filter((k) => mp[k]);
              return (
                <div key={mp.module} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{def?.label}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {enabled.map((k) => (
                        <span key={k} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-medium">
                          {PERM_LABELS[k]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(form.can_approve_amendments || form.can_approve_waivers || form.can_modify_matrices) && (
        <div className="flex flex-wrap gap-2">
          {form.can_approve_amendments && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg">
              <Zap className="w-3 h-3" /> Approve Amendments
            </span>
          )}
          {form.can_approve_waivers && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg">
              <Zap className="w-3 h-3" /> Approve Waivers
            </span>
          )}
          {form.can_modify_matrices && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg">
              <Zap className="w-3 h-3" /> Modify Approval Matrices
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export default function RoleCreatePage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [scopes, setScopes] = useState([]);

  const [form, setForm] = useState({
    name: "", code: "", role_type: "BUSINESS", scope: "", description: "",
    approval_cap_amount: "",
    can_approve_amendments: false, can_approve_waivers: false, can_modify_matrices: false,
  });

  const [modulePerms, setModulePerms] = useState(defaultModulePerms());

  useEffect(() => {
    scopesAPI.list().then((res) => setScopes(res?.results || res || []));
  }, []);

  const step1Valid = form.name.trim().length > 0 && form.code.trim().length > 0 && form.scope && form.role_type;

  const handleSave = async (status = "DRAFT") => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        code: form.code.trim(),
        scope: form.scope,
        description: form.description,
        role_type: form.role_type,
        status,
        approval_cap_amount: form.approval_cap_amount || null,
        can_approve_amendments: form.can_approve_amendments,
        can_approve_waivers: form.can_approve_waivers,
        can_modify_matrices: form.can_modify_matrices,
        module_permissions: modulePerms
          .filter((mp) => PERM_KEYS.some((k) => mp[k]))
          .map((mp) => ({
            module: mp.module,
            can_view: mp.can_view,
            can_create: mp.can_create,
            can_edit: mp.can_edit,
            can_delete: mp.can_delete,
            can_approve: mp.can_approve,
          })),
      };
      await rolesAPI.create(payload);
      toast.success(status === "PUBLISHED" ? "Role published" : "Role saved as draft");
      navigate(`${basePath}/roles`);
    } catch (err) {
      toast.error(err.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Role" backTo={`${basePath}/roles`} />
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <StepBar step={step} />

        {step === 1 && <Step1 form={form} setForm={setForm} scopes={scopes} />}
        {step === 2 && <Step2 modulePerms={modulePerms} setModulePerms={setModulePerms} />}
        {step === 3 && <Step3 form={form} modulePerms={modulePerms} />}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((p) => p - 1) : navigate(`${basePath}/roles`))}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {step > 1 ? "← Back" : "Cancel"}
          </button>
          <div className="flex items-center gap-2">
            {step === 3 && (
              <Button variant="secondary" onClick={() => handleSave("DRAFT")} loading={saving}>
                Save as Draft
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep((p) => p + 1)} disabled={step === 1 && !step1Valid}>
                Next →
              </Button>
            ) : (
              <Button onClick={() => handleSave("PUBLISHED")} loading={saving} icon={Shield}>
                Publish Role
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
