import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { agreementsAPI, leaseRulesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Building2 } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";

const BoolRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`text-sm font-medium ${value ? "text-emerald-600" : "text-gray-400"}`}>{value ? "Yes" : "No"}</span>
  </div>
);
const ValRow = ({ label, value, suffix = "" }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium">{value != null ? `${value}${suffix}` : "—"}</span>
  </div>
);

export default function LeaseARRulesPage() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    agreementsAPI.list().then((r) => setAgreements(r?.results || r || [])).catch(() => setAgreements([]));
  }, []);

  useEffect(() => {
    if (!selectedId) { setData(null); return; }
    setLoading(true);
    leaseRulesAPI.get(selectedId).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [selectedId]);

  const ar = data?.ar_rules || {};

  return (
    <div>
      <Card className="p-6">
        <div className="flex gap-4 mb-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
          >
            <option value="">Select agreement...</option>
            {agreements.map((a) => (
              <option key={a.id} value={a.id}>{a.lease_id || a.id}</option>
            ))}
          </select>
          {selectedId && (
            <Button size="sm" onClick={() => navigate(`/billing/lease-rules/${selectedId}/edit`)}>Edit AR Rules</Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Dispute handling */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dispute Handling</h4>
              <BoolRow label="Hold collection on dispute" value={ar.dispute_hold} />
              <BoolRow label="Stop interest on dispute" value={ar.stop_interest_on_dispute} />
              <BoolRow label="Stop reminders on dispute" value={ar.stop_reminders_on_dispute} />
            </div>

            {/* Credit notes */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Credit Notes</h4>
              <BoolRow label="Credit notes allowed" value={ar.credit_note_allowed} />
              <BoolRow label="Requires approval" value={ar.credit_note_requires_approval} />
              <ValRow label="Max credit note %" value={ar.max_credit_note_percent} suffix="%" />
            </div>

            {/* Reminders & escalation */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Reminders & Escalation</h4>
              <BoolRow label="Auto reminders enabled" value={ar.auto_reminder_enabled} />
              <ValRow label="Days before due" value={ar.reminder_days_before_due} suffix=" days" />
              <ValRow label="Days after due" value={ar.reminder_days_after_due} suffix=" days" />
              <ValRow label="Escalation after (days)" value={ar.escalation_days} suffix=" days" />
            </div>
          </div>
        ) : (
          <EmptyState icon={Building2} title="Select an agreement" description="Choose an agreement to view AR rules" />
        )}
      </Card>
    </div>
  );
}
