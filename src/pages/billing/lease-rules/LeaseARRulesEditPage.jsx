import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { leaseRulesAPI, agreementsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

export default function LeaseARRulesEditPage() {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      leaseRulesAPI.get(agreementId),
      agreementsAPI.get(agreementId),
    ]).then(([rules, ag]) => {
      setData(rules);
      setAgreement(ag);
      const ar = rules?.ar_rules || {};
      setForm({
        dispute_hold: !!ar.dispute_hold,
        stop_interest_on_dispute: ar.stop_interest_on_dispute !== false,
        stop_reminders_on_dispute: ar.stop_reminders_on_dispute !== false,
      });
    }).catch(() => setData(null)).finally(() => setLoading(false));
  }, [agreementId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await leaseRulesAPI.update(agreementId, { ar_rules: form });
      toast.success("AR rules updated");
      navigate("/billing/lease-rules");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [f]: v }));
  };

  if (loading && !form) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!form) return <div className="text-center py-12 text-gray-500">Not found</div>;

  return (
    <div>
      <PageHeader title="Edit AR Rules" subtitle={agreement?.lease_id} backTo="/billing/lease-rules" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Dispute Handling</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.dispute_hold} onChange={set("dispute_hold")} className="rounded" />Hold collection when disputed</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.stop_interest_on_dispute} onChange={set("stop_interest_on_dispute")} className="rounded" />Stop interest on dispute</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.stop_reminders_on_dispute} onChange={set("stop_reminders_on_dispute")} className="rounded" />Stop reminders on dispute</label>
          </div>
        </Card>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate("/billing/lease-rules")}>Cancel</Button>
          <Button type="submit" loading={saving}>Save</Button>
        </div>
      </form>
    </div>
  );
}
