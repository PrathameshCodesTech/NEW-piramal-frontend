import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { ageingConfigAPI, ageingBucketsAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import PageHeader from "../../../components/ui/PageHeader";
import Select from "../../../components/ui/Select";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";

const REF_OPTIONS = [{ value: "INVOICE_DATE", label: "Invoice Date" }, { value: "DUE_DATE", label: "Due Date" }];
const CURR_OPTIONS = [{ value: "DOCUMENT_CURRENCY", label: "Document Currency" }, { value: "BASE_CURRENCY", label: "Base Currency" }];

const BLANK_BUCKET = { label: "", from_days: "", to_days: "", color_code: "#6B7280", sort_order: "", include_in_dso: true };

export default function AgeingSetupPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isConfigEdit = pathname.endsWith("/config");
  const [config, setConfig] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  // Bucket add/edit inline state
  const [editingBucketId, setEditingBucketId] = useState(null); // null = none, "new" = adding
  const [bucketForm, setBucketForm] = useState(BLANK_BUCKET);
  const [savingBucket, setSavingBucket] = useState(false);
  const [deletingBucketId, setDeletingBucketId] = useState(null);

  const loadBuckets = () =>
    ageingBucketsAPI.list().then((r) => setBuckets(r?.results || r || [])).catch(() => {});

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
      loadBuckets();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setInitializing(false);
    }
  };

  // Ageing config form
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

  // Bucket helpers
  const setBF = (f) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setBucketForm((p) => ({ ...p, [f]: v }));
  };

  const startAdd = () => {
    setEditingBucketId("new");
    setBucketForm({ ...BLANK_BUCKET, sort_order: buckets.length + 1 });
  };

  const startEdit = (b) => {
    setEditingBucketId(b.id);
    setBucketForm({
      label: b.label || "",
      from_days: b.from_days != null ? String(b.from_days) : "",
      to_days: b.to_days != null ? String(b.to_days) : "",
      color_code: b.color_code || "#6B7280",
      sort_order: b.sort_order != null ? String(b.sort_order) : "",
      include_in_dso: b.include_in_dso !== false,
    });
  };

  const cancelBucket = () => {
    setEditingBucketId(null);
    setBucketForm(BLANK_BUCKET);
  };

  const saveBucket = async () => {
    if (!bucketForm.label.trim()) { toast.error("Label required"); return; }
    setSavingBucket(true);
    try {
      const payload = {
        label: bucketForm.label.trim(),
        from_days: parseInt(bucketForm.from_days, 10) || 0,
        to_days: bucketForm.to_days ? parseInt(bucketForm.to_days, 10) : null,
        color_code: bucketForm.color_code,
        include_in_dso: bucketForm.include_in_dso,
      };
      if (bucketForm.sort_order) payload.sort_order = parseInt(bucketForm.sort_order, 10);

      if (editingBucketId === "new") {
        await ageingBucketsAPI.create(payload);
        toast.success("Bucket created");
      } else {
        await ageingBucketsAPI.update(editingBucketId, payload);
        toast.success("Bucket updated");
      }
      cancelBucket();
      loadBuckets();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingBucket(false);
    }
  };

  const deleteBucket = async (bucketId) => {
    if (!window.confirm("Delete this ageing bucket?")) return;
    setDeletingBucketId(bucketId);
    try {
      await ageingBucketsAPI.delete(bucketId);
      toast.success("Bucket deleted");
      loadBuckets();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingBucketId(null);
    }
  };

  // Config edit route
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
      {/* Config summary */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Ageing Config</h3>
        {loading ? <div className="py-4 text-center text-gray-500 text-sm">Loading...</div> : config ? (
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><dt className="text-gray-500 text-xs">Reference Date</dt><dd className="font-medium">{config.reference_date}</dd></div>
            <div><dt className="text-gray-500 text-xs">Currency</dt><dd className="font-medium">{config.currency_handling}</dd></div>
            <div><dt className="text-gray-500 text-xs">Include Disputed</dt><dd className="font-medium">{config.include_disputed_in_standard_ageing ? "Yes" : "No"}</dd></div>
            <div><dt className="text-gray-500 text-xs">Exclude Credit-Blocked</dt><dd className="font-medium">{config.exclude_credit_blocked_customers ? "Yes" : "No"}</dd></div>
          </dl>
        ) : <p className="text-sm text-gray-500">No config set.</p>}
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate("/billing/ageing/config")}>Edit Config</Button>
      </Card>

      {/* Ageing Buckets */}
      <Card>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">Ageing Buckets</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInitDefaults}
              loading={initializing}
              disabled={buckets.length > 0 || initializing}
            >
              Initialize Defaults
            </Button>
            <Button size="sm" onClick={startAdd} disabled={editingBucketId !== null}>
              <Plus className="w-3.5 h-3.5 mr-1" />Add Bucket
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Label</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">From (days)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">To (days)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Color</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Order</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">DSO</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* New bucket row */}
              {editingBucketId === "new" && (
                <tr className="bg-emerald-50">
                  <td className="px-3 py-2"><Input value={bucketForm.label} onChange={setBF("label")} placeholder="e.g. 0-30" /></td>
                  <td className="px-3 py-2"><Input type="number" value={bucketForm.from_days} onChange={setBF("from_days")} placeholder="0" /></td>
                  <td className="px-3 py-2"><Input type="number" value={bucketForm.to_days} onChange={setBF("to_days")} placeholder="30 (blank = ∞)" /></td>
                  <td className="px-3 py-2"><input type="color" value={bucketForm.color_code} onChange={setBF("color_code")} className="h-8 w-12 rounded border border-gray-300 cursor-pointer" /></td>
                  <td className="px-3 py-2"><Input type="number" value={bucketForm.sort_order} onChange={setBF("sort_order")} placeholder="#" /></td>
                  <td className="px-3 py-2"><input type="checkbox" checked={bucketForm.include_in_dso} onChange={setBF("include_in_dso")} className="rounded" /></td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button type="button" onClick={saveBucket} disabled={savingBucket} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded" title="Save"><Check className="w-4 h-4" /></button>
                      <button type="button" onClick={cancelBucket} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Cancel"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}

              {buckets.length === 0 && editingBucketId !== "new" && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No buckets yet. Initialize defaults or add manually.</td></tr>
              )}

              {buckets.map((b) => (
                editingBucketId === b.id ? (
                  <tr key={b.id} className="bg-blue-50">
                    <td className="px-3 py-2"><Input value={bucketForm.label} onChange={setBF("label")} /></td>
                    <td className="px-3 py-2"><Input type="number" value={bucketForm.from_days} onChange={setBF("from_days")} /></td>
                    <td className="px-3 py-2"><Input type="number" value={bucketForm.to_days} onChange={setBF("to_days")} placeholder="blank = ∞" /></td>
                    <td className="px-3 py-2"><input type="color" value={bucketForm.color_code} onChange={setBF("color_code")} className="h-8 w-12 rounded border border-gray-300 cursor-pointer" /></td>
                    <td className="px-3 py-2"><Input type="number" value={bucketForm.sort_order} onChange={setBF("sort_order")} /></td>
                    <td className="px-3 py-2"><input type="checkbox" checked={bucketForm.include_in_dso} onChange={setBF("include_in_dso")} className="rounded" /></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button type="button" onClick={saveBucket} disabled={savingBucket} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded" title="Save"><Check className="w-4 h-4" /></button>
                        <button type="button" onClick={cancelBucket} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Cancel"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{b.label}</td>
                    <td className="px-4 py-3 text-gray-600">{b.from_days}</td>
                    <td className="px-4 py-3 text-gray-600">{b.to_days ?? "∞"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border border-gray-300" style={{ background: b.color_code }} />
                        <span className="text-xs text-gray-500">{b.color_code}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.sort_order ?? "—"}</td>
                    <td className="px-4 py-3">{b.include_in_dso ? <span className="text-emerald-600 text-xs font-medium">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(b)} disabled={editingBucketId !== null} className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                          <Pencil className="w-3 h-3" />Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBucket(b.id)}
                          disabled={deletingBucketId === b.id}
                          className="text-xs text-red-500 hover:text-red-600 font-medium inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />{deletingBucketId === b.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
