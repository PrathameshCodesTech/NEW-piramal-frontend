import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Check, Shield, Eye, Pencil, Plus, Trash2, Zap,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { rolesAPI, scopesAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";

// ── Module permissions matrix ─────────────────────────────────────────────────

const MODULES = [
  { key: "PROPERTY", label: "Properties" },
  { key: "TENANT", label: "Tenant Setup" },
  { key: "LEASE", label: "Lease Management" },
  { key: "REVENUE", label: "Revenue & Billing" },
  { key: "AR", label: "AR & Collections" },
  { key: "COLLECTIONS", label: "Payments" },
  { key: "DASHBOARD", label: "Dashboard" },
  { key: "APPROVALS", label: "Approvals" },
  { key: "DOCUMENTS", label: "Documents" },
];

const PERM_COLS = [
  { key: "can_view", label: "View", icon: Eye },
  { key: "can_create", label: "Create", icon: Plus },
  { key: "can_edit", label: "Edit", icon: Pencil },
  { key: "can_delete", label: "Delete", icon: Trash2 },
  { key: "can_approve", label: "Approve", icon: Check },
];

const defaultModulePerms = () =>
  MODULES.map((m) => ({
    module: m.key,
    can_view: false,
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_approve: false,
  }));

// ── Step indicators ───────────────────────────────────────────────────────────

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
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-sm font-medium ${active ? "text-emerald-700" : done ? "text-gray-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-300 mx-3" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 — Role Details ─────────────────────────────────────────────────────

function Step1({ form, setForm, scopes }) {
  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: typeof e === "string" ? e : e.target.value }));

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Role Name *</label>
        <input
          type="text"
          required
          placeholder="e.g. Property Manager"
          value={form.name}
          onChange={set("name")}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Role Type *</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "ADMIN", label: "Admin", desc: "Full system access" },
            { val: "BUSINESS", label: "Business", desc: "Operations team" },
            { val: "TENANT", label: "Tenant", desc: "Tenant portal access" },
            { val: "READONLY", label: "Read Only", desc: "View-only access" },
          ].map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role_type: t.val }))}
              className={`flex flex-col items-start p-3 border rounded-xl text-left transition-colors ${
                form.role_type === t.val
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <span className={`text-sm font-semibold ${form.role_type === t.val ? "text-emerald-700" : "text-gray-700"}`}>
                {t.label}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">{t.desc}</span>
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
          rows={3}
          placeholder="Describe what this role can do..."
          value={form.description}
          onChange={set("description")}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Approval Cap (₹)</label>
          <input
            type="number"
            placeholder="No limit"
            value={form.approval_cap_amount}
            onChange={set("approval_cap_amount")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-col gap-2 pt-5">
          {[
            { k: "can_approve_amendments", label: "Approve Amendments" },
            { k: "can_approve_waivers", label: "Approve Waivers" },
            { k: "can_modify_matrices", label: "Modify Approval Matrices" },
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

// ── Step 2 — Module Permissions ───────────────────────────────────────────────

function Step2({ modulePerms, setModulePerms }) {
  const toggle = (i, key) => {
    setModulePerms((p) =>
      p.map((m, idx) => (idx === i ? { ...m, [key]: !m[key] } : m))
    );
  };

  const toggleAll = (i) => {
    const mp = modulePerms[i];
    const allOn = PERM_COLS.every((c) => mp[c.key]);
    setModulePerms((p) =>
      p.map((m, idx) =>
        idx === i
          ? { ...m, ...Object.fromEntries(PERM_COLS.map((c) => [c.key, !allOn])) }
          : m
      )
    );
  };

  const toggleCol = (key) => {
    const allOn = modulePerms.every((m) => m[key]);
    setModulePerms((p) => p.map((m) => ({ ...m, [key]: !allOn })));
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        Configure what each module allows for this role. Toggle rows or columns to set all at once.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 rounded-tl-lg">Module</th>
              {PERM_COLS.map((col) => (
                <th key={col.key} className="px-3 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => toggleCol(col.key)}
                    className="flex flex-col items-center gap-1 text-xs font-medium text-gray-500 hover:text-emerald-600 mx-auto"
                    title={`Toggle all ${col.label}`}
                  >
                    <col.icon className="w-3.5 h-3.5" />
                    {col.label}
                  </button>
                </th>
              ))}
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">All</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {modulePerms.map((mp, i) => {
              const mod = MODULES.find((m) => m.key === mp.module);
              const allOn = PERM_COLS.every((c) => mp[c.key]);
              return (
                <tr key={mp.module} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">{mod?.label}</span>
                  </td>
                  {PERM_COLS.map((col) => (
                    <td key={col.key} className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(i, col.key)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          mp[col.key] ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                            mp[col.key] ? "left-4" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleAll(i)}
                      className="text-gray-400 hover:text-emerald-600"
                      title={allOn ? "Clear all" : "Enable all"}
                    >
                      {allOn ? (
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Step 3 — Review & Save ────────────────────────────────────────────────────

function Step3({ form, modulePerms }) {
  const enabledModules = modulePerms.filter((mp) =>
    PERM_COLS.some((c) => mp[c.key])
  );

  return (
    <div className="space-y-5 max-w-xl">
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-800">{form.name || "—"}</p>
            <p className="text-xs text-gray-500">{form.role_type} role</p>
          </div>
        </div>
        {form.description && (
          <p className="text-sm text-gray-600">{form.description}</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Module Access</p>
        {enabledModules.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No module permissions configured.</p>
        ) : (
          <div className="space-y-2">
            {enabledModules.map((mp) => {
              const mod = MODULES.find((m) => m.key === mp.module);
              const enabledPerms = PERM_COLS.filter((c) => mp[c.key]);
              return (
                <div key={mp.module} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-gray-700 w-32">{mod?.label}</span>
                  <div className="flex flex-wrap gap-1">
                    {enabledPerms.map((c) => (
                      <span key={c.key} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {form.approval_cap_amount && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <Zap className="w-4 h-4" />
          Approval cap: ₹{Number(form.approval_cap_amount).toLocaleString("en-IN")}
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
    name: "",
    role_type: "BUSINESS",
    scope: "",
    description: "",
    approval_cap_amount: "",
    can_approve_amendments: false,
    can_approve_waivers: false,
    can_modify_matrices: false,
  });

  const [modulePerms, setModulePerms] = useState(defaultModulePerms());

  useEffect(() => {
    scopesAPI.list().then((res) => setScopes(res?.results || res || []));
  }, []);

  const step1Valid = form.name.trim().length > 0 && form.scope && form.role_type;

  const handleSave = async (status = "DRAFT") => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        scope: form.scope,
        description: form.description,
        role_type: form.role_type,
        status,
        approval_cap_amount: form.approval_cap_amount || null,
        can_approve_amendments: form.can_approve_amendments,
        can_approve_waivers: form.can_approve_waivers,
        can_modify_matrices: form.can_modify_matrices,
        module_permissions: modulePerms
          .filter((mp) => PERM_COLS.some((c) => mp[c.key]))
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
      toast.success(`Role ${status === "PUBLISHED" ? "published" : "saved as draft"}`);
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

      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-4xl">
        <StepBar step={step} />

        {step === 1 && <Step1 form={form} setForm={setForm} scopes={scopes} />}
        {step === 2 && <Step2 modulePerms={modulePerms} setModulePerms={setModulePerms} />}
        {step === 3 && <Step3 form={form} modulePerms={modulePerms} />}

        {/* Footer navigation */}
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
              <Button
                onClick={() => setStep((p) => p + 1)}
                disabled={step === 1 && !step1Valid}
              >
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
