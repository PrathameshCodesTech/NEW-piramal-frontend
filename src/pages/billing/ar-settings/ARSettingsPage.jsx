import { useState, useEffect } from "react";
import { arGlobalSettingsAPI } from "../../../services/api";
import Card from "../../../components/ui/Card";

export default function ARSettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    arGlobalSettingsAPI.list().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (!data) return <div className="py-12 text-center text-gray-500">No AR settings found. Create to configure.</div>;

  return (
    <Card className="p-6 max-w-xl">
      <h3 className="text-sm font-semibold mb-4">AR Global Settings</h3>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between"><dt>Dispute Management</dt><dd>{data.enable_dispute_management ? "On" : "Off"}</dd></div>
        <div className="flex justify-between"><dt>Credit Note Workflow</dt><dd>{data.enable_credit_note_workflow ? "On" : "Off"}</dd></div>
      </dl>
      <p className="text-xs text-gray-500 mt-4">Edit via API for now. Form coming soon.</p>
    </Card>
  );
}
