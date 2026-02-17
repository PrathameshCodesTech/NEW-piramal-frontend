import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RotateCcw, FileText } from "lucide-react";
import { siteBillingConfigAPI, sitesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import NumberingSection from "./sections/NumberingSection";
import GenerationSection from "./sections/GenerationSection";
import PaymentTermsSection from "./sections/PaymentTermsSection";
import TaxSection from "./sections/TaxSection";
import LedgerSection from "./sections/LedgerSection";

export default function SiteConfigEditPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [site, setSite] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      siteBillingConfigAPI.bySite(siteId).catch(() => null),
      sitesAPI.get(siteId).catch(() => null),
    ])
      .then(([c, s]) => {
        setConfig(c);
        setSite(s);
        if (c) {
          setForm({
            invoice_pattern: c.invoice_pattern ?? "INV/{PROP}/{YEAR}/{COUNTER}",
            include_property_code: c.include_property_code !== false,
            include_year_token: c.include_year_token !== false,
            counter_reset_frequency: c.counter_reset_frequency ?? "YEARLY",
            counter_padding: c.counter_padding ?? 4,
            generation_mode: c.generation_mode ?? "AUTO",
            generation_day_of_month: c.generation_day_of_month ?? 1,
            relative_generation_rule: c.relative_generation_rule ?? "",
            invoice_granularity: c.invoice_granularity ?? "CONSOLIDATED",
            billing_address_override: !!c.billing_address_override,
            default_gst_invoice_flag: c.default_gst_invoice_flag !== false,
            default_payment_term: c.default_payment_term ?? "NET_30",
            grace_period_days: c.grace_period_days ?? 7,
            early_payment_discount_percent: String(c.early_payment_discount_percent ?? 0),
            early_payment_discount_days: c.early_payment_discount_days ?? 0,
            late_fee_percent: String(c.late_fee_percent ?? 0),
            late_fee_flat_amount: c.late_fee_flat_amount ?? "",
            interest_rate_annual: String(c.interest_rate_annual ?? 0),
            default_gst_rate: String(c.default_gst_rate ?? 18),
            gst_split_logic: c.gst_split_logic ?? "IGST",
            revenue_gl: c.revenue_gl ?? "",
            gst_output_gl: c.gst_output_gl ?? "",
            gst_input_gl: c.gst_input_gl ?? "",
            receivables_gl: c.receivables_gl ?? "",
            late_fee_gl: c.late_fee_gl ?? "",
            interest_gl: c.interest_gl ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!config?.id || !form) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        early_payment_discount_percent: parseFloat(form.early_payment_discount_percent) || 0,
        early_payment_discount_days: parseInt(form.early_payment_discount_days, 10) || 0,
        late_fee_percent: parseFloat(form.late_fee_percent) || 0,
        late_fee_flat_amount: form.late_fee_flat_amount ? parseFloat(form.late_fee_flat_amount) : null,
        interest_rate_annual: parseFloat(form.interest_rate_annual) || 0,
        default_gst_rate: parseFloat(form.default_gst_rate) || 0,
        counter_padding: parseInt(form.counter_padding, 10) || 4,
        generation_day_of_month: parseInt(form.generation_day_of_month, 10) || 1,
      };
      await siteBillingConfigAPI.update(config.id, payload);
      toast.success("Site billing config updated");
      navigate(`/billing/site-config/${siteId}`);
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!config?.id) return;
    try {
      const res = await siteBillingConfigAPI.previewInvoiceNumber(config.id);
      setPreview(res);
    } catch {
      toast.error("Failed to preview");
    }
  };

  const handleResetCounter = async (value) => {
    if (!config?.id) return;
    setResetting(true);
    try {
      await siteBillingConfigAPI.resetCounter(config.id, value ?? 1);
      toast.success("Counter reset");
      setConfig((p) => (p ? { ...p, current_counter: value ?? 1 } : p));
      setShowReset(false);
    } catch {
      toast.error("Failed to reset counter");
    } finally {
      setResetting(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12 text-gray-500">
        No billing config for this site. Create one first.
      </div>
    );
  }

  const siteName = site?.name || site?.code || siteId;

  return (
    <div>
      <PageHeader
        title={`Edit: ${siteName}`}
        backTo={`/billing/site-config/${siteId}`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={FileText} onClick={handlePreview}>
              Preview Invoice#
            </Button>
            <Button variant="secondary" icon={RotateCcw} onClick={() => setShowReset(true)}>
              Reset Counter
            </Button>
          </div>
        }
      />

      {preview && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm font-medium text-emerald-800">Next invoice number</p>
          <p className="text-lg font-mono text-emerald-900">{preview.next_invoice_number}</p>
          <p className="text-xs text-emerald-600 mt-1">Current counter: {preview.current_counter}</p>
          <button type="button" onClick={() => setPreview(null)} className="text-xs text-emerald-600 underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <NumberingSection form={form} setForm={setForm} readOnly={false} />
        </Card>

        <Card className="p-6">
          <GenerationSection form={form} setForm={setForm} readOnly={false} />
        </Card>

        <Card className="p-6">
          <PaymentTermsSection form={form} setForm={setForm} readOnly={false} />
        </Card>

        <Card className="p-6">
          <TaxSection form={form} setForm={setForm} readOnly={false} />
        </Card>

        <Card className="p-6">
          <LedgerSection form={form} setForm={setForm} readOnly={false} />
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate(`/billing/site-config/${siteId}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={() => handleResetCounter(1)}
        title="Reset Invoice Counter"
        message="Reset the counter to 1? This will affect the next invoice number generated."
        loading={resetting}
        confirmLabel="Reset to 1"
      />
    </div>
  );
}
