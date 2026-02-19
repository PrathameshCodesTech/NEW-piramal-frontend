import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, User, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { usersAPI, rolesAPI, membershipsAPI, scopesAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";

// ── Step bar ──────────────────────────────────────────────────────────────────

function StepBar({ step }) {
  const steps = ["Account Details", "Scope & Role"];
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

// ── Step 1 — Account Details ──────────────────────────────────────────────────

function Step1({ form, setForm }) {
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
          <input
            type="text"
            value={form.first_name}
            onChange={set("first_name")}
            placeholder="John"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
          <input
            type="text"
            value={form.last_name}
            onChange={set("last_name")}
            placeholder="Smith"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Username *</label>
        <input
          type="text"
          required
          value={form.username}
          onChange={set("username")}
          placeholder="john.smith"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={set("email")}
          placeholder="john.smith@company.com"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={set("password")}
          placeholder="Minimum 8 characters"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
        <input
          type="text"
          value={form.department}
          onChange={set("department")}
          placeholder="e.g. Operations, Finance..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={form.is_superuser}
          onChange={(e) => setForm((p) => ({ ...p, is_superuser: e.target.checked }))}
          className="rounded text-emerald-600 focus:ring-emerald-500"
        />
        <div>
          <span className="text-sm text-gray-700 font-medium">Super Admin</span>
          <p className="text-xs text-gray-400">Full system access — bypasses all scope restrictions</p>
        </div>
      </label>
    </div>
  );
}

// ── Step 2 — Scope & Role ─────────────────────────────────────────────────────

function Step2({ membership, setMembership, scopes }) {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (membership.scope_id) {
      rolesAPI.list({ scope_id: membership.scope_id })
        .then((res) => setRoles(res?.results || res || []))
        .catch(() => setRoles([]));
    } else {
      setRoles([]);
    }
  }, [membership.scope_id]);

  const handleScopeChange = (e) => {
    setMembership((p) => ({ ...p, scope_id: e.target.value, role_id: "" }));
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="border-l-2 border-blue-400 pl-4 py-1">
        <p className="text-sm font-medium text-gray-700">Assign this user to a scope</p>
        <p className="text-xs text-gray-400 mt-0.5">
          A scope membership determines what data this user can access and what role they have. You can add more memberships later.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Scope</label>
        <select
          value={membership.scope_id}
          onChange={handleScopeChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">Select scope (optional)</option>
          {scopes.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.scope_type}</option>
          ))}
        </select>
      </div>

      {membership.scope_id && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role in this scope *</label>
          {roles.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              No roles found for this scope. Create roles first from the Roles tab, or skip this step.
            </p>
          ) : (
            <div className="space-y-2">
              {roles.map((r) => (
                <label key={r.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={r.id}
                    checked={membership.role_id === String(r.id)}
                    onChange={() => setMembership((p) => ({ ...p, role_id: String(r.id) }))}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className={`flex-1 p-3 border rounded-xl transition-colors ${
                    membership.role_id === String(r.id) ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.role_type && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-medium">
                          {r.role_type}
                        </span>
                      )}
                      {r.is_system && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full font-medium">
                          System
                        </span>
                      )}
                      {r.description && (
                        <span className="text-xs text-gray-400">{r.description}</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {!membership.scope_id && (
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <Link2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-600">No scope assigned</p>
            <p className="text-xs text-gray-400 mt-0.5">
              The user account will be created without scope access. You can assign them to a scope later via Memberships.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function UserCreatePage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [scopes, setScopes] = useState([]);

  const [form, setForm] = useState({
    username: "", email: "", password: "",
    first_name: "", last_name: "",
    department: "", is_superuser: false,
  });

  const [membership, setMembership] = useState({ scope_id: "", role_id: "" });

  useEffect(() => {
    scopesAPI.list().then((res) => setScopes(res?.results || res || [])).catch(() => {});
  }, []);

  const step1Valid = form.username.trim() && form.email.trim() && form.password.trim();

  const handleCreate = async () => {
    setSaving(true);
    try {
      // Step 1: Create the user
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        is_superuser: form.is_superuser,
      };
      const created = await usersAPI.create(payload);

      // Step 2: Create membership if scope + role selected
      if (membership.scope_id && membership.role_id) {
        await membershipsAPI.create({
          user: created.id,
          scope: membership.scope_id,
          role: membership.role_id,
        });
        toast.success(`User created and assigned to scope`);
      } else {
        toast.success("User created");
      }

      navigate(`${basePath}/users`);
    } catch (err) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create User" backTo={`${basePath}/users`} />

      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl">
        <StepBar step={step} />

        {step === 1 && <Step1 form={form} setForm={setForm} />}
        {step === 2 && <Step2 membership={membership} setMembership={setMembership} scopes={scopes} />}

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((p) => p - 1) : navigate(`${basePath}/users`))}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {step > 1 ? "← Back" : "Cancel"}
          </button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button variant="secondary" onClick={handleCreate} loading={saving}>
                Create without scope
              </Button>
            )}
            {step === 1 ? (
              <Button onClick={() => setStep(2)} disabled={!step1Valid} icon={User}>
                Next: Assign Scope →
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                loading={saving}
                disabled={!membership.scope_id || !membership.role_id}
                icon={Link2}
              >
                Create & Assign
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
