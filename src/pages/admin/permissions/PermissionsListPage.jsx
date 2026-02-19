import { useState, useEffect } from "react";
import {
  Search, Key, Building2, Users, FileCheck, TrendingUp,
  Receipt, CreditCard, LayoutDashboard, GitMerge, FileText,
  Eye, Plus, Pencil, Trash2, Check, Info, ChevronDown, ChevronRight,
} from "lucide-react";
import { permissionsAPI } from "../../../services/api";

// ── Module permission framework (mirrors the Create Role wizard) ──────────────

const MODULE_DEFS = [
  {
    key: "PROPERTY", label: "Properties", icon: Building2, color: "emerald",
    desc: "Sites, towers, floors, units & amenity master data",
    perms: {
      can_view:    "Browse property hierarchy, view unit specs & room details",
      can_create:  "Add new sites, towers, floors and units",
      can_edit:    "Update unit details, amenities and room configurations",
      can_delete:  "Remove units and property records",
      can_approve: "Approve property status changes and configurations",
    },
  },
  {
    key: "TENANT", label: "Tenant Setup", icon: Users, color: "blue",
    desc: "Tenant companies, contacts and KYC documents",
    perms: {
      can_view:    "View tenant profiles, contacts and KYC submissions",
      can_create:  "Add new tenant companies and contacts",
      can_edit:    "Update tenant details, preferences and contact info",
      can_delete:  "Remove tenant records and contacts",
      can_approve: "Approve or reject KYC submissions",
    },
  },
  {
    key: "LEASE", label: "Lease Management", icon: FileCheck, color: "purple",
    desc: "Agreements, term dates, financials, escalations and amendments",
    perms: {
      can_view:    "View lease agreements, financials and clause config",
      can_create:  "Draft new lease agreements",
      can_edit:    "Edit lease terms, financials and allocated units",
      can_delete:  "Cancel or delete draft leases",
      can_approve: "Submit for approval, activate and terminate leases",
    },
  },
  {
    key: "REVENUE", label: "Rent Schedule & Revenue", icon: TrendingUp, color: "amber",
    desc: "Rent schedule lines, revenue recognition and escalations",
    perms: {
      can_view:    "View rent schedules and revenue recognition entries",
      can_create:  "Generate new rent schedule lines",
      can_edit:    "Adjust rent amounts and schedule dates",
      can_delete:  "Remove schedule entries",
      can_approve: "Approve revenue recognition postings",
    },
  },
  {
    key: "AR", label: "Invoices & AR", icon: Receipt, color: "orange",
    desc: "Invoices, AR summaries, ageing buckets and billing rules",
    perms: {
      can_view:    "View invoices, AR summaries and ageing reports",
      can_create:  "Raise new invoices and billing schedules",
      can_edit:    "Edit invoice line items and billing rules",
      can_delete:  "Void invoices and billing records",
      can_approve: "Approve credit notes and AR adjustments",
    },
  },
  {
    key: "COLLECTIONS", label: "Payments & Collections", icon: CreditCard, color: "teal",
    desc: "Payments, credit notes, disputes and collection follow-ups",
    perms: {
      can_view:    "View payment records and credit note details",
      can_create:  "Record incoming payments and credit notes",
      can_edit:    "Edit payment details and update collection status",
      can_delete:  "Remove payment records (reversal)",
      can_approve: "Approve refunds and payment reversals",
    },
  },
  {
    key: "DASHBOARD", label: "Dashboard & Analytics", icon: LayoutDashboard, color: "indigo",
    desc: "KPIs, charts, portfolio map and occupancy analytics",
    perms: {
      can_view:    "Access the main dashboard with KPIs and charts",
      can_create:  "—",
      can_edit:    "—",
      can_delete:  "—",
      can_approve: "—",
    },
  },
  {
    key: "APPROVALS", label: "Approval Matrices", icon: GitMerge, color: "rose",
    desc: "Approval rules, SLA configs, escalations and workflows",
    perms: {
      can_view:    "View approval rules and their approval paths",
      can_create:  "Draft new approval rules",
      can_edit:    "Update rule conditions, approvers and SLA settings",
      can_delete:  "Remove draft approval rules",
      can_approve: "Activate and publish approval rules",
    },
  },
  {
    key: "DOCUMENTS", label: "Documents", icon: FileText, color: "gray",
    desc: "Lease documents, KYC files, clause library and compliance docs",
    perms: {
      can_view:    "View and download uploaded documents",
      can_create:  "Upload new documents and link to records",
      can_edit:    "Update document metadata and version notes",
      can_delete:  "Remove document records",
      can_approve: "Approve document submissions for compliance",
    },
  },
];

const PERM_COLS = [
  { key: "can_view",    label: "View",    icon: Eye,     color: "text-blue-600 bg-blue-50 border-blue-100" },
  { key: "can_create",  label: "Create",  icon: Plus,    color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { key: "can_edit",    label: "Edit",    icon: Pencil,  color: "text-amber-600 bg-amber-50 border-amber-100" },
  { key: "can_delete",  label: "Delete",  icon: Trash2,  color: "text-red-600 bg-red-50 border-red-100" },
  { key: "can_approve", label: "Approve", icon: Check,   color: "text-purple-600 bg-purple-50 border-purple-100" },
];

const ICON_COLORS = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue:    "bg-blue-50 text-blue-600",
  purple:  "bg-purple-50 text-purple-600",
  amber:   "bg-amber-50 text-amber-600",
  orange:  "bg-orange-50 text-orange-600",
  teal:    "bg-teal-50 text-teal-600",
  indigo:  "bg-indigo-50 text-indigo-600",
  rose:    "bg-rose-50 text-rose-600",
  gray:    "bg-gray-100 text-gray-600",
};

// ── Module permission reference card ─────────────────────────────────────────

function ModuleRefCard({ def, search }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = def.icon;
  const iconClass = ICON_COLORS[def.color] || "bg-gray-100 text-gray-500";

  const matchesSearch = !search || [def.label, def.desc, ...Object.values(def.perms)]
    .some((s) => s.toLowerCase().includes(search.toLowerCase()));

  if (!matchesSearch) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{def.label}</p>
          <p className="text-xs text-gray-400 truncate">{def.desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {PERM_COLS.map((col) => {
            const ColIcon = col.icon;
            const isNA = def.perms[col.key] === "—";
            return (
              <div
                key={col.key}
                title={isNA ? "Not applicable" : `${col.label}: ${def.perms[col.key]}`}
                className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                  isNA ? "bg-gray-50 border-gray-100 opacity-30" : col.color
                }`}
              >
                <ColIcon className="w-3 h-3" />
              </div>
            );
          })}
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400 ml-1" /> : <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />}
        </div>
      </div>

      {/* Expanded permission details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERM_COLS.map((col) => {
              const ColIcon = col.icon;
              const isNA = def.perms[col.key] === "—";
              return (
                <div key={col.key} className={`flex items-start gap-2.5 ${isNA ? "opacity-40" : ""}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 ${col.color}`}>
                    <ColIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{col.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{def.perms[col.key]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Legacy permissions tab ────────────────────────────────────────────────────

function LegacyPermsTab({ data, loading }) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.code?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q);
  });

  const groups = {};
  filtered.forEach((p) => {
    const cat = (p.code.split(".")[0]) || "general";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  });

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search permission codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} permissions</span>
      </div>
      <div className="space-y-4">
        {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([cat, perms]) => (
          <div key={cat} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Key className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800 capitalize">{cat}</p>
              <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                {perms.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {perms.map((perm) => (
                <div key={perm.id} className="flex items-center gap-4 px-5 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-sm font-mono text-gray-700 flex-1">{perm.code}</p>
                  {perm.description && <p className="text-xs text-gray-400 hidden sm:block">{perm.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PermissionsListPage() {
  const [legacyPerms, setLegacyPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("modules");
  const [search, setSearch] = useState("");

  useEffect(() => {
    permissionsAPI.list()
      .then((res) => { setLegacyPerms(res?.results || res || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("modules")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "modules" ? "text-emerald-700 border-emerald-500" : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          <Info className="w-4 h-4" /> Module Permissions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("legacy")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "legacy" ? "text-emerald-700 border-emerald-500" : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          <Key className="w-4 h-4" /> Legacy Permission Codes
          {legacyPerms.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">{legacyPerms.length}</span>
          )}
        </button>
      </div>

      {activeTab === "modules" && (
        <div>
          {/* Explanation banner */}
          <div className="border-l-2 border-emerald-500 pl-4 py-3 mb-5 bg-emerald-50 rounded-r-xl">
            <p className="text-sm font-semibold text-emerald-800">Module-Based Permission System</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Each role gets access to modules with specific actions. Click a module to see exactly what each permission level allows.
              Permissions are set when creating or editing a role.
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules or permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              {PERM_COLS.map((col) => {
                const ColIcon = col.icon;
                return (
                  <span key={col.key} className={`flex items-center gap-1 px-2 py-1 rounded border ${col.color}`}>
                    <ColIcon className="w-3 h-3" />{col.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {MODULE_DEFS.map((def) => (
              <ModuleRefCard key={def.key} def={def} search={search} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "legacy" && (
        <LegacyPermsTab data={legacyPerms} loading={loading} />
      )}
    </div>
  );
}
