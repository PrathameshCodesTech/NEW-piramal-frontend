import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Activity, Clock, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronRight, Play, Zap, Copy, ToggleLeft,
  ToggleRight, Trash2, X, ArrowRight, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { approvalsAPI, rolesAPI } from "../../services/api";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

// ── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
const fmtM = (m) => m != null ? `${m} mo` : "—";

const STATUS_COLOR = {
  ACTIVE: "emerald",
  DRAFT: "amber",
  INACTIVE: "red",
};

const TENANT_TYPE_LABELS = {
  CORPORATE: "Corporate",
  RETAIL: "Retail",
  INDUSTRIAL: "Industrial",
  RESIDENTIAL: "Residential",
};

// ── Stats Row ────────────────────────────────────────────────────────────────

function StatsRow({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: "Total Rules", value: stats.total_rules ?? 0, icon: ShieldCheck, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Active Rules", value: stats.active_rules ?? 0, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Avg SLA (h)", value: stats.avg_sla_hours ?? 0, icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
    { label: "Bottlenecks", value: stats.bottleneck_count ?? 0, icon: AlertTriangle, bg: "bg-red-50", text: "text-red-600" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${c.text}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Rule Row ─────────────────────────────────────────────────────────────────

function RuleRow({ rule, onActivate, onDeactivate, onDuplicate, onDelete, expanded, onToggle }) {
  const levels = rule.levels || [];
  const l1 = levels.find((l) => l.level === 1);
  const l2 = levels.find((l) => l.level === 2);
  const l3 = levels.find((l) => l.level === 3);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <button type="button" className="text-gray-400 shrink-0">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Name + label */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{rule.name}</p>
          <p className="text-xs text-gray-500">{rule.label || "—"}</p>
        </div>

        {/* L1 / L2 / L3 */}
        <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
          <span className="min-w-[90px]">
            <span className="font-medium text-gray-400 mr-1">L1:</span>
            {l1 ? `${l1.role_name} (${l1.sla_hours}h)` : "—"}
          </span>
          <span className="min-w-[90px]">
            <span className="font-medium text-gray-400 mr-1">L2:</span>
            {l2 ? `${l2.role_name} (${l2.sla_hours}h)` : "—"}
          </span>
          <span className="min-w-[90px]">
            <span className="font-medium text-gray-400 mr-1">L3:</span>
            {l3 ? `${l3.role_name} (${l3.sla_hours}h)` : "—"}
          </span>
        </div>

        {/* SLA total */}
        <span className="text-xs text-gray-500 hidden sm:block min-w-[50px]">
          {rule.total_sla_hours ?? rule.overall_sla_hours ?? 0}h SLA
        </span>

        {/* Status */}
        <Badge color={STATUS_COLOR[rule.status] || "gray"}>{rule.status}</Badge>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {rule.status === "ACTIVE" ? (
            <button
              type="button"
              onClick={() => onDeactivate(rule.id)}
              title="Deactivate"
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <ToggleRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onActivate(rule.id)}
              title="Activate"
              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <ToggleLeft className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDuplicate(rule.id)}
            title="Duplicate"
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(rule.id)}
            title="Delete"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-4">
          {/* Conditions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trigger Conditions</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs">
                Lease Value: {fmt(rule.lease_value_min)} – {fmt(rule.lease_value_max)}
              </span>
              <span className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs">
                Term: {fmtM(rule.lease_term_min_months)} – {fmtM(rule.lease_term_max_months)}
              </span>
              {(rule.tenant_types || []).length > 0 && (
                <span className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs">
                  Tenants: {rule.tenant_types.map((t) => TENANT_TYPE_LABELS[t] || t).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Approval path */}
          {levels.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Approval Path</p>
              <div className="flex flex-wrap items-center gap-2">
                {levels.sort((a, b) => a.level - b.level).map((lvl, i) => (
                  <div key={lvl.id} className="flex items-center gap-2">
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs">
                      <span className="font-semibold text-emerald-700">L{lvl.level}</span>
                      <span className="text-gray-600 ml-1">{lvl.role_name}</span>
                      <span className="text-gray-400 ml-1">· {lvl.sla_hours}h</span>
                    </div>
                    {i < levels.length - 1 && <ArrowRight className="w-3 h-3 text-gray-400" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escalation */}
          {rule.enable_escalations && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Escalation after {rule.escalate_after_hours}h → {rule.escalate_to_role_name || "—"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Simulator Panel ──────────────────────────────────────────────────────────

function SimulatorPanel() {
  const [form, setForm] = useState({ lease_value: "", tenant_type: "", lease_term_months: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const payload = {};
      if (form.lease_value) payload.lease_value = parseFloat(form.lease_value);
      if (form.tenant_type) payload.tenant_type = form.tenant_type;
      if (form.lease_term_months) payload.lease_term_months = parseInt(form.lease_term_months);
      const res = await approvalsAPI.simulate(payload);
      setResult(res);
    } catch (err) {
      toast.error(err.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-gray-700">Rule Simulator</h3>
      </div>
      <p className="text-xs text-gray-500">Test which approval rule would apply to a given lease.</p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Lease Value (₹)</label>
          <input
            type="number"
            placeholder="e.g. 7500000"
            value={form.lease_value}
            onChange={set("lease_value")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tenant Type</label>
          <select
            value={form.tenant_type}
            onChange={set("tenant_type")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="">Any</option>
            <option value="CORPORATE">Corporate</option>
            <option value="RETAIL">Retail</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="RESIDENTIAL">Residential</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Lease Term (months)</label>
          <input
            type="number"
            placeholder="e.g. 36"
            value={form.lease_term_months}
            onChange={set("lease_term_months")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <Button className="w-full" onClick={handleSimulate} loading={loading} icon={Play}>
          Simulate
        </Button>
      </div>

      {result && (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          {!result.matched_rule ? (
            <div className="text-center py-4">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{result.message || "No matching rule found."}</p>
            </div>
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-emerald-700">Matched Rule</p>
                <p className="text-sm font-bold text-emerald-800">{result.matched_rule.name}</p>
                <p className="text-xs text-emerald-600">{result.matched_rule.label}</p>
              </div>

              {result.approval_path?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Approval Path</p>
                  <div className="space-y-2">
                    {result.approval_path.map((step) => (
                      <div key={step.level} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                          L{step.level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700">{step.role}</p>
                          <p className="text-xs text-gray-500">{step.sla_hours}h SLA</p>
                        </div>
                        <span className="text-xs text-gray-400">{step.cumulative_sla_hours}h total</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-600">{result.path_summary}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Activity Log ─────────────────────────────────────────────────────────────

function ActivityLog({ activity = [] }) {
  const [open, setOpen] = useState(false);
  if (!activity.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <Activity className="w-4 h-4 text-gray-500" />
        <span>Recent Activity</span>
        <span className="ml-auto text-xs text-gray-400">{activity.length} events</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {activity.map((log, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700">{log.detail}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {log.user_name} · {log.rule_name} · {new Date(log.timestamp).toLocaleDateString("en-IN")}
                </p>
              </div>
              <Badge color={log.action === "ACTIVATED" ? "emerald" : log.action === "DEACTIVATED" ? "red" : "gray"} className="shrink-0 text-[10px]">
                {log.action}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add Rule Wizard ──────────────────────────────────────────────────────────

function AddRuleWizard({ onClose, onSaved, roles }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [conditions, setConditions] = useState({
    name: "",
    lease_value_min: "",
    lease_value_max: "",
    lease_term_min_months: "",
    lease_term_max_months: "",
    tenant_types: [],
  });

  const [levels, setLevels] = useState([
    { level: 1, role: "", sla_hours: 24, approval_required: true, allow_auto_skip_if_vacant: false },
  ]);

  const [sla, setSla] = useState({
    overall_sla_hours: 48,
    enable_escalations: false,
    escalate_after_hours: 24,
    escalate_to_role: "",
    send_escalation_notification: true,
    parallel_approvals_same_level: false,
  });

  const toggleTenantType = (t) => {
    setConditions((p) => ({
      ...p,
      tenant_types: p.tenant_types.includes(t) ? p.tenant_types.filter((x) => x !== t) : [...p.tenant_types, t],
    }));
  };

  const setLevel = (i, k, v) => {
    setLevels((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  };

  const addLevel = () => {
    if (levels.length >= 5) return;
    setLevels((p) => [...p, { level: p.length + 1, role: "", sla_hours: 24, approval_required: true, allow_auto_skip_if_vacant: false }]);
  };

  const removeLevel = (i) => {
    setLevels((p) => p.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, level: idx + 1 })));
  };

  const handleSave = async (status = "DRAFT") => {
    setSaving(true);
    try {
      const payload = {
        name: conditions.name,
        status,
        lease_value_min: conditions.lease_value_min || null,
        lease_value_max: conditions.lease_value_max || null,
        lease_term_min_months: conditions.lease_term_min_months || null,
        lease_term_max_months: conditions.lease_term_max_months || null,
        tenant_types: conditions.tenant_types,
        overall_sla_hours: sla.overall_sla_hours,
        enable_escalations: sla.enable_escalations,
        escalate_after_hours: sla.escalate_after_hours || null,
        escalate_to_role: sla.escalate_to_role || null,
        send_escalation_notification: sla.send_escalation_notification,
        parallel_approvals_same_level: sla.parallel_approvals_same_level,
        levels: levels.filter((l) => l.role).map((l) => ({
          level: l.level,
          role: parseInt(l.role),
          sla_hours: parseInt(l.sla_hours),
          approval_required: l.approval_required,
          allow_auto_skip_if_vacant: l.allow_auto_skip_if_vacant,
        })),
      };
      await approvalsAPI.create(payload);
      toast.success(`Rule ${status === "ACTIVE" ? "created and activated" : "saved as draft"}`);
      onSaved();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const TENANT_TYPES = ["CORPORATE", "RETAIL", "INDUSTRIAL", "RESIDENTIAL"];

  const step1Valid = conditions.name.trim().length > 0;
  const step2Valid = levels.some((l) => l.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Add Approval Rule</h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${s <= step ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {s}
                  </div>
                  <span className={`text-xs ${s === step ? "text-emerald-700 font-medium" : "text-gray-400"}`}>
                    {s === 1 ? "Conditions" : s === 2 ? "Approvers" : "Options"}
                  </span>
                  {s < 3 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 1 — Conditions */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rule Name *</label>
                <input
                  type="text"
                  placeholder="e.g. High-Value Corporate Leases"
                  value={conditions.name}
                  onChange={(e) => setConditions((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="border-l-2 border-emerald-500 pl-4">
                <p className="text-xs font-semibold text-gray-600 mb-3">Trigger when lease value is:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={conditions.lease_value_min}
                      onChange={(e) => setConditions((p) => ({ ...p, lease_value_min: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max (₹)</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={conditions.lease_value_max}
                      onChange={(e) => setConditions((p) => ({ ...p, lease_value_max: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-blue-400 pl-4">
                <p className="text-xs font-semibold text-gray-600 mb-3">Lease term (months):</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min</label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={conditions.lease_term_min_months}
                      onChange={(e) => setConditions((p) => ({ ...p, lease_term_min_months: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max</label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={conditions.lease_term_max_months}
                      onChange={(e) => setConditions((p) => ({ ...p, lease_term_max_months: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-purple-400 pl-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Tenant types (leave empty for all):</p>
                <div className="flex flex-wrap gap-2">
                  {TENANT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTenantType(t)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        conditions.tenant_types.includes(t)
                          ? "bg-purple-100 border-purple-300 text-purple-700 font-medium"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-200"
                      }`}
                    >
                      {TENANT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Approvers */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Define who needs to approve, in order. At least one approver required.</p>
              <div className="space-y-3">
                {levels.map((lvl, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                          {lvl.level}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Level {lvl.level}</span>
                      </div>
                      {levels.length > 1 && (
                        <button type="button" onClick={() => removeLevel(i)} className="text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Role *</label>
                        <select
                          value={lvl.role}
                          onChange={(e) => setLevel(i, "role", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="">Select role</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">SLA (hours)</label>
                        <input
                          type="number"
                          min={1}
                          value={lvl.sla_hours}
                          onChange={(e) => setLevel(i, "sla_hours", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lvl.approval_required}
                          onChange={(e) => setLevel(i, "approval_required", e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        Approval required
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lvl.allow_auto_skip_if_vacant}
                          onChange={(e) => setLevel(i, "allow_auto_skip_if_vacant", e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        Auto-skip if vacant
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {levels.length < 5 && (
                <button
                  type="button"
                  onClick={addLevel}
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add approval level
                </button>
              )}
            </div>
          )}

          {/* Step 3 — Options */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Overall SLA Limit (hours)</label>
                <input
                  type="number"
                  min={1}
                  value={sla.overall_sla_hours}
                  onChange={(e) => setSla((p) => ({ ...p, overall_sla_hours: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sla.parallel_approvals_same_level}
                  onChange={(e) => setSla((p) => ({ ...p, parallel_approvals_same_level: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-sm text-gray-700 font-medium">Parallel approvals at same level</p>
                  <p className="text-xs text-gray-500">All approvers at same level can approve simultaneously</p>
                </div>
              </label>

              <div className="border-l-2 border-amber-400 pl-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sla.enable_escalations}
                    onChange={(e) => setSla((p) => ({ ...p, enable_escalations: e.target.checked }))}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Enable escalations</p>
                    <p className="text-xs text-gray-500">Auto-escalate if approver doesn't respond in time</p>
                  </div>
                </label>

                {sla.enable_escalations && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Escalate after (hours)</label>
                      <input
                        type="number"
                        min={1}
                        value={sla.escalate_after_hours}
                        onChange={(e) => setSla((p) => ({ ...p, escalate_after_hours: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Escalate to role</label>
                      <select
                        value={sla.escalate_to_role}
                        onChange={(e) => setSla((p) => ({ ...p, escalate_to_role: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="">Select role</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sla.send_escalation_notification}
                        onChange={(e) => setSla((p) => ({ ...p, send_escalation_notification: e.target.checked }))}
                        className="rounded text-emerald-600"
                      />
                      Send notification on escalation
                    </label>
                  </>
                )}
              </div>

              {/* Review summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Summary</p>
                <p className="text-sm font-semibold text-gray-800">{conditions.name}</p>
                <p className="text-xs text-gray-500">
                  {fmt(conditions.lease_value_min)} – {fmt(conditions.lease_value_max)} ·{" "}
                  {conditions.tenant_types.length > 0 ? conditions.tenant_types.join(", ") : "All tenant types"} ·{" "}
                  {levels.filter((l) => l.role).length} approver level{levels.filter((l) => l.role).length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((p) => p - 1) : onClose())}
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
                disabled={step === 1 ? !step1Valid : step === 2 ? !step2Valid : false}
              >
                Next →
              </Button>
            ) : (
              <Button onClick={() => handleSave("ACTIVE")} loading={saving} icon={CheckCircle2}>
                Activate Rule
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [roles, setRoles] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, statsRes] = await Promise.all([
        approvalsAPI.list(),
        approvalsAPI.stats().catch(() => null),
      ]);
      setRules(rulesRes?.results || rulesRes || []);
      setStats(statsRes);
    } catch {
      toast.error("Failed to load approval rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    rolesAPI.list().then((res) => setRoles(res?.results || res || [])).catch(() => {});
  }, [loadData]);

  const filtered = rules.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.name?.toLowerCase().includes(q) || r.label?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleActivate = async (id) => {
    try {
      await approvalsAPI.activate(id);
      toast.success("Rule activated");
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeactivate = async (id) => {
    try {
      await approvalsAPI.deactivate(id);
      toast.success("Rule deactivated");
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleDuplicate = async (id) => {
    try {
      await approvalsAPI.duplicate(id);
      toast.success("Rule duplicated as draft");
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this approval rule?")) return;
    try {
      await approvalsAPI.delete(id);
      toast.success("Rule deleted");
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsRow stats={stats} />

      <div className="flex gap-6">
        {/* Left — Rule list */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filter bar */}
          <div className="border-l-2 border-emerald-500 pl-5 py-3 pr-5 rounded-r-lg">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <Button icon={Plus} onClick={() => setShowWizard(true)}>Add Rule</Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">No approval rules yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first rule to start managing approvals</p>
              <button
                type="button"
                onClick={() => setShowWizard(true)}
                className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                + Create Rule
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  expanded={expandedId === rule.id}
                  onToggle={() => setExpandedId((p) => (p === rule.id ? null : rule.id))}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Activity log */}
          {stats?.recent_activity && <ActivityLog activity={stats.recent_activity} />}
        </div>

        {/* Right — Simulator */}
        <div className="w-72 shrink-0 hidden lg:block">
          <SimulatorPanel />
        </div>
      </div>

      {showWizard && (
        <AddRuleWizard
          roles={roles}
          onClose={() => setShowWizard(false)}
          onSaved={() => { setShowWizard(false); loadData(); }}
        />
      )}
    </div>
  );
}
