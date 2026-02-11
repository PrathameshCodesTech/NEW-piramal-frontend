import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clauseUsagesAPI, clausesAPI, agreementsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function ClauseUsageCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clauses, setClauses] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [clause, setClause] = useState("");
  const [agreement, setAgreement] = useState("");
  const [customBodyText, setCustomBodyText] = useState("");

  useEffect(() => {
    clausesAPI.list().then((res) => setClauses(res?.results || res || [])).catch(() => setClauses([]));
    agreementsAPI.list().then((res) => setAgreements(res?.results || res || [])).catch(() => setAgreements([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clause || !agreement) {
      toast.error("Please select clause and agreement");
      return;
    }
    setLoading(true);
    try {
      await clauseUsagesAPI.create({ clause: parseInt(clause, 10), agreement: parseInt(agreement, 10), custom_body_text: customBodyText || undefined });
      toast.success("Clause attached to agreement");
      navigate("/clauses/usages");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clauseOptions = clauses.map((c) => ({ value: String(c.id), label: `${c.clause_id || c.id} - ${c.title}` }));
  const agreementOptions = agreements.map((a) => ({ value: String(a.id), label: a.lease_id || String(a.id) }));

  const formContent = (
    <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-lg"}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Clause *" value={clause} onChange={(e) => setClause(e.target.value)} options={clauseOptions} required />
          <Select label="Agreement *" value={agreement} onChange={(e) => setAgreement(e.target.value)} options={agreementOptions} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Body Text (optional)</label>
            <textarea value={customBodyText} onChange={(e) => setCustomBodyText(e.target.value)} rows={6} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y" placeholder="Override clause text for this agreement..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/clauses/usages")}>Cancel</Button>
            <Button type="submit" loading={loading}>Attach</Button>
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
