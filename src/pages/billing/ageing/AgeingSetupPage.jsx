import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ageingConfigAPI, ageingBucketsAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";

export default function AgeingSetupPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ageingConfigAPI.list().catch(() => null),
      ageingBucketsAPI.list().then((r) => r?.results || r || []),
    ])
      .then(([c, b]) => {
        setConfig(Array.isArray(c) ? null : c);
        setBuckets(b || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleInitDefaults = async () => {
    setInitializing(true);
    try {
      await ageingBucketsAPI.initializeDefaults();
      toast.success("Default buckets created");
      ageingBucketsAPI.list().then((r) => setBuckets(r?.results || r || []));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setInitializing(false);
    }
  };

  const columns = [
    { key: "label", label: "Label" },
    { key: "from_days", label: "From" },
    { key: "to_days", label: "To" },
    { key: "color_code", label: "Color" },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Ageing Config</h3>
        {loading ? <div className="py-6 text-center text-gray-500">Loading...</div> : config ? (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500">Reference Date</dt><dd>{config.reference_date}</dd></div>
            <div><dt className="text-gray-500">Currency</dt><dd>{config.currency_handling}</dd></div>
          </dl>
        ) : <p className="text-sm text-gray-500">No config.</p>}
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate("/billing/ageing/config")}>Edit Config</Button>
      </Card>
      <Card>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">Ageing Buckets</h3>
          <Button size="sm" onClick={handleInitDefaults} loading={initializing} disabled={buckets.length > 0}>Initialize Defaults</Button>
        </div>
        <DataTable columns={columns} data={buckets} loading={loading} />
      </Card>
    </div>
  );
}
