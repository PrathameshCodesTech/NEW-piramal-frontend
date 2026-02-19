import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clauseUsagesAPI, clausesAPI, clauseVersionsAPI, agreementsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function ClauseUsageCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clauses, setClauses] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const [clause, setClause] = useState("");
  const [agreement, setAgreement] = useState("");
  const [clauseVersion, setClauseVersion] = useState("");
  const [customBodyText, setCustomBodyText] = useState("");
  const [customConfigText, setCustomConfigText] = useState("");
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    clausesAPI.list({ status: "ACTIVE" }).then((res) => setClauses(res?.results || res || [])).catch(() => setClauses([]));
    agreementsAPI.list().then((res) => setAgreements(res?.results || res || [])).catch(() => setAgreements([]));
  }, []);

  // When clause changes, load its versions so user can pin a specific version
  useEffect(() => {
    setClauseVersion("");
    setVersions([]);
    if (!clause) return;
    setVersionsLoading(true);
    clauseVersionsAPI.list({ clause_id: clause })
      .then((res) => setVersions(res?.results || res || []))
      .catch(() => setVersions([]))
      .finally(() => setVersionsLoading(false));
  }, [clause]);

  const handleConfigChange = (val) => {
    setCustomConfigText(val);
    setConfigError("");
    if (val.trim()) {
      try { JSON.parse(val); }
      catch { setConfigError("Invalid JSON — check syntax"); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clause || !agreement) {
      toast.error("Please select a clause and an agreement");
      return;
    }
    if (customConfigText.trim() && configError) {
      toast.error("Fix the JSON error in custom config before saving");
      return;
    }

    let customConfig;
    if (customConfigText.trim()) {
      try { customConfig = JSON.parse(customConfigText); }
      catch { toast.error("Invalid JSON in custom config"); return; }
    }

    setLoading(true);
    try {
      await clauseUsagesAPI.create({
        clause: parseInt(clause, 10),
        agreement: parseInt(agreement, 10),
        ...(clauseVersion && { clause_version: parseInt(clauseVersion, 10) }),
        ...(customBodyText.trim() && { custom_body_text: customBodyText }),
        ...(customConfig && { custom_config: customConfig }),
      });
      toast.success("Clause attached to agreement");
      navigate("/clauses/usages");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clauseOptions = clauses.map((c) => ({ value: String(c.id), label: `${c.clause_id || c.id} — ${c.title}` }));
  const agreementOptions = agreements.map((a) => ({ value: String(a.id), label: a.lease_id || String(a.id) }));
  const versionOptions = [
    { value: "", label: "Use current version at attach time" },
    ...versions.map((v) => ({
      value: String(v.id),
      label: `v${v.major_version}.${v.minor_version}${v.version_status === "CURRENT" ? " (current)" : ""} — ${v.change_summary || "no summary"}`,
    })),
  ];

  const formContent = (
    <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-xl"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Clause */}
        <Select label="Clause *" value={clause} onChange={(e) => setClause(e.target.value)} options={clauseOptions} required />

        {/* Version pin (shown once clause is selected) */}
        {clause && (
          <div>
            <Select
              label="Pin to Version (optional)"
              value={clauseVersion}
              onChange={(e) => setClauseVersion(e.target.value)}
              options={versionsLoading ? [{ value: "", label: "Loading versions…" }] : versionOptions}
            />
            <p className="text-xs text-gray-400 mt-1">
              Leave unpinned to use whichever version is CURRENT at the moment you attach. It will not auto-update after future clause bumps. Pin a specific version to freeze this agreement to that exact text.
            </p>
          </div>
        )}

        {/* Agreement */}
        <Select label="Agreement *" value={agreement} onChange={(e) => setAgreement(e.target.value)} options={agreementOptions} required />

        {/* Custom body text */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Custom Body Text <span className="text-gray-400 font-normal">(optional override)</span></label>
          <textarea
            value={customBodyText}
            onChange={(e) => setCustomBodyText(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            placeholder="Leave blank to use the clause body as-is. Enter text to override it for this agreement only."
          />
        </div>

        {/* Custom config JSON */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Custom Config <span className="text-gray-400 font-normal">(optional JSON override)</span></label>
          <textarea
            value={customConfigText}
            onChange={(e) => handleConfigChange(e.target.value)}
            rows={5}
            className={`w-full border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500 resize-y ${configError ? "border-red-400 focus:ring-red-400" : "border-gray-300"}`}
            placeholder={'{\n  "renewal": { "pre_negotiation_days": 90 }\n}'}
          />
          {configError && <p className="text-xs text-red-600 mt-1">{configError}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Overrides specific sections of the clause config for this agreement only (e.g. different notice period). Leave blank to inherit the clause template config.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={() => navigate("/clauses/usages")}>Cancel</Button>
          <Button type="submit" loading={loading}>Attach to Agreement</Button>
        </div>
      </form>
    </Card>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Attach Clause to Agreement" backTo="/clauses/usages" />
      {formContent}
    </div>
  );
}

