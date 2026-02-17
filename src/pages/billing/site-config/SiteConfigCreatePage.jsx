import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { siteBillingConfigAPI, sitesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import NumberingSection from "./sections/NumberingSection";
import GenerationSection from "./sections/GenerationSection";
import PaymentTermsSection from "./sections/PaymentTermsSection";
import TaxSection from "./sections/TaxSection";
import LedgerSection from "./sections/LedgerSection";

const DEFAULT_FORM = {
  site: "",
  invoice_pattern: "INV/{PROP}/{YEAR}/{COUNTER}",
  include_property_code: true,
  include_year_token: true,
  counter_reset_frequency: "YEARLY",
  counter_padding: 4,
  generation_mode: "AUTO",
  generation_day_of_month: 1,
  relative_generation_rule: "",
  invoice_granularity: "CONSOLIDATED",
  billing_address_override: false,
  default_gst_invoice_flag: true,
  default_payment_term: "NET_30",
  grace_period_days: 7,
  early_payment_discount_percent: "0",
  early_payment_discount_days: 0,
  late_fee_percent: "0",
  late_fee_flat_amount: "",
  interest_rate_annual: "0",
  default_gst_rate: "18",
  gst_split_logic: "IGST",
  revenue_gl: "",
  gst_output_gl: "",
  gst_input_gl: "",
  receivables_gl: "",
  late_fee_gl: "",
  interest_gl: "",
};

export default function SiteConfigCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSite = searchParams.get("site");
  const [sites, setSites] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    site: preselectedSite || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      sitesAPI.list().then((r) => r?.results || r || []),
      siteBillingConfigAPI.list().then((r) => r?.results || r || []),
    ]).then(([s, c]) => {
      setSites(s);
      setConfigs(c);
    });
  }, []);

  const configuredSiteIds = new Set(configs.map((c) => c.site).filter(Boolean));
  const availableSites = sites.filter((s) => !configuredSiteIds.has(s.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        site: Number(form.site),
        early_payment_discount_percent: parseFloat(form.early_payment_discount_percent) || 0,
        early_payment_discount_days: parseInt(form.early_payment_discount_days, 10) || 0,
        late_fee_percent: parseFloat(form.late_fee_percent) || 0,
        late_fee_flat_amount: form.late_fee_flat_amount ? parseFloat(form.late_fee_flat_amount) : null,
        interest_rate_annual: parseFloat(form.interest_rate_annual) || 0,
        default_gst_rate: parseFloat(form.default_gst_rate) || 0,
        counter_padding: parseInt(form.counter_padding, 10) || 4,
        generation_day_of_month: parseInt(form.generation_day_of_month, 10) || 1,
      };
      await siteBillingConfigAPI.create(payload);
      toast.success("Site billing config created");
      navigate("/billing/site-config");
    } catch (err) {
      toast.error(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Site Billing Config" backTo="/billing/site-config" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <Select
            label="Site"
            value={form.site}
            onChange={(e) => setForm((p) => ({ ...p, site: e.target.value }))}
            options={availableSites.map((s) => ({ value: s.id, label: s.name || s.code || s.id }))}
            placeholder="Select site"
            required
          />
        </Card>

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
          <Button variant="secondary" type="button" onClick={() => navigate("/billing/site-config")}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Config
          </Button>
        </div>
      </form>
    </div>
  );
}
