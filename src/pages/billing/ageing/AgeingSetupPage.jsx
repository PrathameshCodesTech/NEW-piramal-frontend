import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { ageingConfigAPI, ageingBucketsAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import PageHeader from "../../../components/ui/PageHeader";
import Select from "../../../components/ui/Select";

const REF_OPTIONS = [{ value: "INVOICE_DATE", label: "Invoice Date" }, { value: "DUE_DATE", label: "Due Date" }];
const CURR_OPTIONS = [{ value: "DOCUMENT_CURRENCY", label: "Document Currency" }, { value: "BASE_CURRENCY", label: "Base Currency" }];

export default function AgeingSetupPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isConfigEdit = pathname.endsWith("/config");
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

  const [configForm, setConfigForm] = useState({
    reference_date: "INVOICE_DATE",
    currency_handling: "DOCUMENT_CURRENCY",
    include_disputed_in_standard_ageing: false,
    exclude_credit_blocked_customers: true,
    show_on_ar_dashboard: true,
    show_in_customer_statements: true,
    enable_separate_disputed_ageing: false,
  });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (config) {
      setConfigForm({
        reference_date: config.reference_date || "INVOICE_DATE",
        currency_handling: config.currency_handling || "DOCUMENT_CURRENCY",
        include_disputed_in_standard_ageing: !!config.include_disputed_in_standard_ageing,
        exclude_credit_blocked_customers: config.exclude_credit_blocked_customers !== false,
        show_on_ar_dashboard: config.show_on_ar_dashboard !== false,
        show_in_customer_statements: config.show_in_customer_statements !== false,
        enable_separate_disputed_ageing: !!config.enable_separate_disputed_ageing,
      });
    }
  }, [config]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      if (config?.id) await ageingConfigAPI.update(config.id, configForm);
      else await ageingConfigAPI.create(configForm);
      toast.success("Config saved");
      ageingConfigAPI.list().then((c) => setConfig(Array.isArray(c) ? null : c));
      navigate("/billing/ageing");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const setConfigField = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setConfigForm((p) => ({ ...p, [f]: v }));
  };

  const columns = [
    { key: "label", label: "Label" },
    { key: "from_days", label: "From" },
    { key: "to_days", label: "To" },
    { key: "color_code", label: "Color" },
  ];

  if (isConfigEdit) {
    return (
      <div>
        <PageHeader title="Ageing Config" backTo="/billing/ageing" />
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4">Ageing Logic</h3>
            <div className="space-y-4">
              <Select label="Reference Date" value={configForm.reference_date} onChange={setConfigField("reference_date")} options={REF_OPTIONS} />
              <Select label="Currency Handling" value={configForm.currency_handling} onChange={setConfigField("currency_handling")} options={CURR_OPTIONS} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={configForm.include_disputed_in_standard_ageing} onChange={setConfigField("include_disputed_in_standard_ageing")} className="rounded" />Include disputed in standard ageing</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={configForm.exclude_credit_blocked_customers} onChange={setConfigField("exclude_credit_blocked_customers")} className="rounded" />Exclude credit-blocked customers</label>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4">Display</h3>
            <label className="flex items-center gap-2"><input type="checkbox" checked={configForm.show_on_ar_dashboard} onChange={setConfigField("show_on_ar_dashboard")} className="rounded" />Show on AR dashboard</label>
            <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={configForm.show_in_customer_statements} onChange={setConfigField("show_in_customer_statements")} className="rounded" />Show in customer statements</label>
            <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={configForm.enable_separate_disputed_ageing} onChange={setConfigField("enable_separate_disputed_ageing")} className="rounded" />Enable separate disputed ageing</label>
          </Card>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => navigate("/billing/ageing")}>Cancel</Button>
            <Button type="submit" loading={savingConfig}>Save</Button>
          </div>
        </form>
      </div>
    );
  }

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
