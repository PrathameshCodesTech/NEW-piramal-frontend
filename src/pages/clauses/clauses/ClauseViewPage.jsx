import { useState, useEffect, useCallback, createElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Pencil, Trash2, Copy, ArrowUpCircle, History,
  RefreshCw, Shield, ScrollText, Users, Gavel, AlertCircle,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Plus,
} from "lucide-react";
import { clausesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import AddRenewalCycleModal from "./AddRenewalCycleModal";

const TABS = ["Details", "Versions"];

const statusColor = (s) =>
  s === "ACTIVE" ? "emerald" : s === "DRAFT" ? "amber" : s === "ARCHIVED" ? "gray" : "red";

const normalizeRenewalCycle = (cycle, idx = 0) => {
  const yearsRaw = Number(cycle?.term_years ?? cycle?.termYears ?? 0);
  const monthsRaw = Number(cycle?.term_months ?? cycle?.termMonths ?? 0);
  const years = Number.isFinite(yearsRaw) ? Math.max(0, yearsRaw) : 0;
  const months = Number.isFinite(monthsRaw) ? Math.min(11, Math.max(0, monthsRaw)) : 0;
  const rentFormula = cycle?.rent_formula || cycle?.rentFormula || "";
  return {
    ...cycle,
    cycle: Number(cycle?.cycle) || idx + 1,
    term_years: years,
    term_months: months,
    termYears: years,
    termMonths: months,
    rent_formula: rentFormula,
    rentFormula,
    comments: cycle?.comments || "",
  };
};

const normalizeClauseConfig = (config = {}) => {
  const cycles = Array.isArray(config?.renewal?.cycles)
    ? config.renewal.cycles.map((c, i) => normalizeRenewalCycle(c, i))
    : [];
  return {
    ...config,
    renewal: {
      ...(config?.renewal || {}),
      cycles,
    },
  };
};

// ── Small helpers ────────────────────────────────────────────────────────────

// Static color map — avoids dynamic class names that Tailwind purges in production
const SECTION_COLORS = {
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600" },
  red:     { bg: "bg-red-50",     icon: "text-red-600" },
  purple:  { bg: "bg-purple-50",  icon: "text-purple-600" },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-600" },
  teal:    { bg: "bg-teal-50",    icon: "text-teal-600" },
  gray:    { bg: "bg-gray-100",   icon: "text-gray-600" },
};

function BoolBadge({ value }) {
  return value
    ? <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Yes</span>
    : <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />No</span>;
}

function SectionCard({ icon, title, color = "emerald", children }) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${(SECTION_COLORS[color] ?? SECTION_COLORS.emerald).bg} flex items-center justify-center`}>
            {icon ? createElement(icon, { className: `w-4 h-4 ${(SECTION_COLORS[color] ?? SECTION_COLORS.emerald).icon}` }) : null}
          </div>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </Card>
  );
}

function KV({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800 mt-0.5">{value ?? "—"}</dd>
    </div>
  );
}

// ── Config section renderers ─────────────────────────────────────────────────

function RenewalSection({ cfg }) {
  if (!cfg) return null;
  const cycleTerm = (c) => {
    if (c?.term) return c.term;
    const years = Number(c?.term_years ?? c?.termYears ?? 0);
    const months = Number(c?.term_months ?? c?.termMonths ?? 0);
    const base = `${years} yr`;
    return months > 0 ? `${base} ${months} mo` : base;
  };
  return (
    <SectionCard icon={RefreshCw} title="Renewal Options" color="blue">
      <dl className="grid grid-cols-2 gap-4 mb-4">
        <KV label="Pre-Negotiation Notice (days)" value={cfg.pre_negotiation_days} />
      </dl>
      {cfg.cycles?.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Renewal Cycles</p>
          <div className="space-y-2">
            {cfg.cycles.map((c, i) => (
              <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                <span className="font-medium text-gray-700 shrink-0">Cycle {i + 1}</span>
                <span className="text-gray-600">{cycleTerm(c)} · {c.rent_formula || c.rentFormula || "—"}</span>
                {c.comments && <span className="text-gray-400 text-xs">{c.comments}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
}

function TerminationSection({ cfg }) {
  if (!cfg) return null;
  return (
    <SectionCard icon={AlertCircle} title="Termination & Early Exit" color="red">
      <dl className="flex gap-8">
        <div><dt className="text-xs font-medium text-gray-500 mb-1">Tenant Permitted</dt><BoolBadge value={cfg.tenant_permitted} /></div>
        <div><dt className="text-xs font-medium text-gray-500 mb-1">Landlord Permitted</dt><BoolBadge value={cfg.landlord_permitted} /></div>
      </dl>
    </SectionCard>
  );
}

function SubletSignageSection({ subletting, signage }) {
  if (!subletting && !signage) return null;
  return (
    <SectionCard icon={Users} title="Sub-letting & Signage" color="purple">
      {subletting && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sub-letting</p>
          <div className="flex gap-4">
            <div><dt className="text-xs font-medium text-gray-500 mb-1">Permitted</dt><BoolBadge value={subletting.permitted} /></div>
          </div>
        </div>
      )}
      {signage && (
        <dl className="grid grid-cols-2 gap-4">
          <div><dt className="text-xs font-medium text-gray-500 mb-1">Entitled</dt><BoolBadge value={signage.entitled} /></div>
          <div><dt className="text-xs font-medium text-gray-500 mb-1">Landlord Approval Required</dt><BoolBadge value={signage.requires_landlord_approval} /></div>
          <KV label={`Max Area (${signage.signage_area_unit || "SQM"})`} value={signage.max_area_sqm} />
          {signage.notes && <div className="col-span-2"><KV label="Notes" value={signage.notes} /></div>}
        </dl>
      )}
    </SectionCard>
  );
}

function ExclusivitySection({ cfg }) {
  if (!cfg) return null;
  return (
    <SectionCard icon={Shield} title="Exclusivity & Non-Compete" color="amber">
      <dl className="grid grid-cols-2 gap-4">
        <div><dt className="text-xs font-medium text-gray-500 mb-1">Exclusive Use</dt><BoolBadge value={cfg.exclusive_use} /></div>
        <KV label="Non-Compete Period (months)" value={cfg.non_compete_months} />
        {cfg.exclusive_category_description && <div className="col-span-2"><KV label="Exclusive Category" value={cfg.exclusive_category_description} /></div>}
        {cfg.excluded_categories?.length > 0 && (
          <div className="col-span-2">
            <dt className="text-xs font-medium text-gray-500 mb-1">Excluded Categories</dt>
            <div className="flex flex-wrap gap-1">{cfg.excluded_categories.map((c, i) => <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{c}</span>)}</div>
          </div>
        )}
        {cfg.non_compete_scope_notes && <div className="col-span-2"><KV label="Non-Compete Scope Notes" value={cfg.non_compete_scope_notes} /></div>}
      </dl>
    </SectionCard>
  );
}

function ReinstInsuranceSection({ reinstatement, insurance }) {
  if (!reinstatement && !insurance) return null;
  return (
    <SectionCard icon={Shield} title="Reinstatement & Insurance" color="teal">
      {reinstatement && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reinstatement</p>
          <dl className="grid grid-cols-2 gap-4">
            <div><dt className="text-xs font-medium text-gray-500 mb-1">Restore Required</dt><BoolBadge value={reinstatement.restore_required} /></div>
            {reinstatement.details && <div className="col-span-2"><KV label="Details" value={reinstatement.details} /></div>}
          </dl>
        </div>
      )}
      {insurance && (
        <dl className="grid grid-cols-2 gap-4">
          <div><dt className="text-xs font-medium text-gray-500 mb-1">Public Liability Required</dt><BoolBadge value={insurance.public_liability_required} /></div>
          <KV label="Min Coverage Amount" value={insurance.min_coverage_amount ? `₹${Number(insurance.min_coverage_amount).toLocaleString("en-IN")}` : null} />
          {insurance.additional_requirements && <div className="col-span-2"><KV label="Additional Requirements" value={insurance.additional_requirements} /></div>}
          {insurance.indemnity_notes && <div className="col-span-2"><KV label="Indemnity Notes" value={insurance.indemnity_notes} /></div>}
        </dl>
      )}
    </SectionCard>
  );
}

function DisputeSection({ cfg }) {
  if (!cfg) return null;
  return (
    <SectionCard icon={Gavel} title="Dispute Resolution & Governing Law" color="gray">
      <dl className="grid grid-cols-2 gap-4">
        <KV label="Mechanism" value={cfg.mechanism} />
        <KV label="Governing Law" value={cfg.governing_law} />
        {cfg.summary && <div className="col-span-2"><KV label="Summary" value={cfg.summary} /></div>}
      </dl>
    </SectionCard>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ClauseViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [showBump, setShowBump] = useState(false);
  // Note: field is "bump" (not bump_type) — matches backend ClauseVersionCreateSerializer
  const [bumpForm, setBumpForm] = useState({ bump: "MINOR", change_summary: "", body_text: "" });
  const [bumping, setBumping] = useState(false);
  const [showAddCycleModal, setShowAddCycleModal] = useState(false);

  const bumpCycles = bumpForm.config?.renewal?.cycles || [];

  const handleAddBumpCycle = (cycle) => {
    setBumpForm((p) => {
      const prevCycles = p.config?.renewal?.cycles || [];
      const nextCycle = normalizeRenewalCycle(cycle, prevCycles.length);
      return {
        ...p,
        config: {
          ...p.config,
          renewal: {
            ...(p.config?.renewal || {}),
            cycles: [
              ...prevCycles,
              nextCycle,
            ],
          },
        },
      };
    });
    setShowAddCycleModal(false);
  };

  const handleRemoveBumpCycle = (idx) => {
    setBumpForm((p) => ({
      ...p,
      config: {
        ...p.config,
        renewal: {
          ...(p.config?.renewal || {}),
          cycles: (p.config?.renewal?.cycles || []).filter((_, i) => i !== idx),
        },
      },
    }));
  };

  const load = useCallback(() => {
    clausesAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (activeTab === 1) {
      setVersionsLoading(true);
      clausesAPI.versions(id)
        .then((res) => setVersions(res?.results || res || []))
        .catch(() => setVersions([]))
        .finally(() => setVersionsLoading(false));
    }
  }, [activeTab, id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clausesAPI.delete(id);
      toast.success("Clause deleted");
      navigate("/clauses/clauses");
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  const handleDuplicate = async () => {
    try {
      const res = await clausesAPI.duplicate(id);
      toast.success("Clause duplicated");
      navigate(`/clauses/clauses/${res.id}`);
    } catch (err) { toast.error(err.message); }
  };

  const openBump = () => {
    const cv = data?.current_version_data || {};
    setBumpForm({
      bump: "MINOR",
      change_summary: "",
      body_text: cv.body_text || "",
      // Preserve current config so it carries over into the new version
      config: normalizeClauseConfig(cv.config || {}),
    });
    setShowBump(true);
  };

  const handleBump = async () => {
    setBumping(true);
    try {
      await clausesAPI.bump(id, {
        bump: bumpForm.bump,                         // ← correct field name
        change_summary: bumpForm.change_summary || "",
        body_text: bumpForm.body_text || "",
        config: normalizeClauseConfig(bumpForm.config || {}),
      });
      toast.success("New version created");
      setShowBump(false);
      load();
      if (activeTab === 1) {
        const vers = await clausesAPI.versions(id);
        setVersions(vers?.results || vers || []);
      }
    } catch (err) { toast.error(err.message); }
    finally { setBumping(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Clause not found</div>;

  const cv = data.current_version_data || {};
  const cfg = cv.config || {};
  const hasConfig = Object.keys(cfg).some((k) => cfg[k] && Object.keys(cfg[k]).length > 0);

  const nextVersion = bumpForm.bump === "MAJOR"
    ? `v${(data.current_version || 1) + 1}.0`
    : `v${data.current_version || 1}.${(data.current_minor_version || 0) + 1}`;

  return (
    <div>
      <PageHeader
        title={data.title}
        subtitle={data.clause_id || "Clause"}
        backTo="/clauses/clauses"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={ArrowUpCircle} onClick={openBump}>Bump Version</Button>
            <Button variant="secondary" size="sm" icon={Copy} onClick={handleDuplicate}>Duplicate</Button>
            <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/clauses/clauses/${id}/edit`)}>Edit</Button>
            <Button variant="danger" icon={Trash2} onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={`px-4 py-2.5 text-sm font-medium ${activeTab === i ? "text-emerald-700 border-b-2 border-emerald-500" : "text-gray-500"}`}>{tab}</button>
        ))}
      </div>

      {/* ── Details tab ── */}
      {activeTab === 0 && (
        <div className="max-w-3xl space-y-4">
          {/* Header card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Badge color={statusColor(data.status)}>{data.status}</Badge>
              <Badge color={data.applies_to === "ALL" ? "purple" : "blue"}>{data.applies_to}</Badge>
              <span className="text-sm text-gray-400 ml-auto">v{data.current_version || 1}.{data.current_minor_version || 0}</span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {[
                ["Clause ID", data.clause_id],
                ["Title", data.title],
                ["Category", data.category_name || data.category_detail?.name],
                ["Applies To", data.applies_to],
                ["Status", data.status],
                ["Version", `v${data.current_version || 1}.${data.current_minor_version || 0}`],
                ["Created", data.created_at ? new Date(data.created_at).toLocaleDateString() : null],
                ["Updated", data.updated_at ? new Date(data.updated_at).toLocaleDateString() : null],
              ].map(([label, value]) => (
                <div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd></div>
              ))}
            </dl>
          </Card>

          {/* Clause body */}
          {cv.body_text && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <ScrollText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-gray-700">Clause Body</h3>
                {cv.change_summary && <span className="text-xs text-gray-400 ml-auto italic">{cv.change_summary}</span>}
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 text-sm leading-relaxed">{cv.body_text}</div>
            </Card>
          )}

          {/* Config sections */}
          {hasConfig && (
            <div className="space-y-3">
              <RenewalSection cfg={cfg.renewal} />
              <TerminationSection cfg={cfg.termination} />
              <SubletSignageSection subletting={cfg.subletting} signage={cfg.signage} />
              <ExclusivitySection cfg={cfg.exclusivity} />
              <ReinstInsuranceSection reinstatement={cfg.reinstatement} insurance={cfg.insurance} />
              <DisputeSection cfg={cfg.dispute} />
            </div>
          )}

          {/* Linked documents */}
          {data.linked_documents?.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Linked Documents</h3>
              <ul className="space-y-2">
                {data.linked_documents.map((doc) => (
                  <li key={doc.link_id}>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-sm">{doc.document_name} ({doc.document_type})</a>
                    <span className="text-gray-400 mx-2">·</span>
                    <button type="button" onClick={() => navigate(`/clauses/documents/${doc.document_id}`)} className="text-gray-500 hover:text-emerald-600 text-sm">View</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* ── Versions tab ── */}
      {activeTab === 1 && (
        <div className="max-w-3xl">
          {versionsLoading
            ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
            : versions.length === 0
              ? <Card className="p-8 text-center text-sm text-gray-500">No version history available.</Card>
              : (
                <div className="space-y-3">
                  {versions.map((v) => (
                    <Card key={v.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-800">v{v.major_version}.{v.minor_version}</span>
                          <Badge color={v.version_status === "CURRENT" ? "emerald" : "gray"}>{v.version_status}</Badge>
                          {v.bump_type && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{v.bump_type}</span>}
                        </div>
                        <span className="text-xs text-gray-500">{v.created_at ? new Date(v.created_at).toLocaleDateString() : ""}</span>
                      </div>
                      {v.change_summary && <p className="text-sm text-gray-600 mb-2">{v.change_summary}</p>}
                      {v.body_text && (
                        <details className="text-xs">
                          <summary className="text-gray-500 cursor-pointer">View clause text</summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">{v.body_text}</div>
                        </details>
                      )}
                    </Card>
                  ))}
                </div>
              )
          }
        </div>
      )}

      {/* ── Dialogs ── */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Clause"
        message={`Are you sure you want to delete "${data.title}"? This cannot be undone.`}
        loading={deleting}
      />

      {showBump && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Card className="p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Bump Version</h3>
            <div className="space-y-4">
              <Select
                label="Bump Type"
                value={bumpForm.bump}
                onChange={(e) => setBumpForm({ ...bumpForm, bump: e.target.value })}
                options={[{ value: "MINOR", label: "Minor — small fix / clarification" }, { value: "MAJOR", label: "Major — significant change / re-draft" }]}
              />
              <Input
                label="Change Summary"
                value={bumpForm.change_summary}
                onChange={(e) => setBumpForm({ ...bumpForm, change_summary: e.target.value })}
                placeholder="Describe what changed in this version..."
              />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Updated Clause Body</label>
                <textarea
                  value={bumpForm.body_text}
                  onChange={(e) => setBumpForm({ ...bumpForm, body_text: e.target.value })}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                />
              </div>
              {/* Renewal Cycles — visible + editable in bump modal */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">Renewal Cycles</span>
                    <span className="text-xs text-gray-400">({bumpCycles.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCycleModal(true)}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Cycle
                  </button>
                </div>
                {bumpCycles.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-gray-400 italic">No renewal cycles. Click "Add Cycle" to add one.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-white border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Cycle</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Term</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Rent Formula</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Comments</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bumpCycles.map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700">{c.cycle ?? i + 1}</td>
                          <td className="px-4 py-2 text-gray-700">
                            {c.term || `${Number(c.term_years ?? c.termYears ?? 0)} yr${Number(c.term_months ?? c.termMonths ?? 0) > 0 ? ` ${Number(c.term_months ?? c.termMonths ?? 0)} mo` : ""}`}
                          </td>
                          <td className="px-4 py-2 text-gray-600">{c.rent_formula || c.rentFormula || "—"}</td>
                          <td className="px-4 py-2 text-gray-400">{c.comments || "—"}</td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveBumpCycle(i)}
                              className="p-0.5 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                              title="Remove cycle"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <p className="text-xs text-gray-400">Other config sections (termination, exclusivity, etc.) carry forward from the current version unchanged.</p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setShowBump(false)}>Cancel</Button>
                <Button size="sm" icon={ArrowUpCircle} onClick={handleBump} loading={bumping}>
                  Bump to {nextVersion}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showAddCycleModal && (
        <AddRenewalCycleModal
          onClose={() => setShowAddCycleModal(false)}
          onAdd={handleAddBumpCycle}
          cycleNumber={bumpCycles.length + 1}
        />
      )}
    </div>
  );
}

