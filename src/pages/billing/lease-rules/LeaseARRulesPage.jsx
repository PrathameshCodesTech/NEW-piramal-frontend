import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { agreementsAPI, leaseRulesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Building2 } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";

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
    if (!selectedId) {
      setData(null);
      return;
    }
    setLoading(true);
    leaseRulesAPI.get(selectedId).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [selectedId]);

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
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : data ? (
          <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-60">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <EmptyState icon={Building2} title="Select an agreement" description="Choose an agreement to view AR rules" />
        )}
      </Card>
    </div>
  );
}
