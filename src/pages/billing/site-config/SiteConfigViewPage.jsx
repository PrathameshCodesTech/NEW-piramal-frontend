import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { siteBillingConfigAPI, sitesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import NumberingSection from "./sections/NumberingSection";
import GenerationSection from "./sections/GenerationSection";
import PaymentTermsSection from "./sections/PaymentTermsSection";
import TaxSection from "./sections/TaxSection";
import LedgerSection from "./sections/LedgerSection";

export default function SiteConfigViewPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      siteBillingConfigAPI.bySite(siteId).catch(() => null),
      sitesAPI.get(siteId).catch(() => null),
    ])
      .then(([config, s]) => {
        setData(config);
        setSite(s);
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const siteName = site?.name || site?.code || siteId;

  const formData = data
    ? {
        invoice_pattern: data.invoice_pattern ?? "",
        include_property_code: data.include_property_code !== false,
        include_year_token: data.include_year_token !== false,
        counter_reset_frequency: data.counter_reset_frequency ?? "",
        counter_padding: data.counter_padding ?? "",
        generation_mode: data.generation_mode ?? "",
        generation_day_of_month: data.generation_day_of_month ?? "",
        relative_generation_rule: data.relative_generation_rule ?? "",
        invoice_granularity: data.invoice_granularity ?? "",
        billing_address_override: !!data.billing_address_override,
        default_gst_invoice_flag: data.default_gst_invoice_flag !== false,
        default_payment_term: data.default_payment_term ?? "",
        grace_period_days: data.grace_period_days ?? "",
        early_payment_discount_percent: data.early_payment_discount_percent ?? "",
        early_payment_discount_days: data.early_payment_discount_days ?? "",
        late_fee_percent: data.late_fee_percent ?? "",
        late_fee_flat_amount: data.late_fee_flat_amount ?? "",
        interest_rate_annual: data.interest_rate_annual ?? "",
        default_gst_rate: data.default_gst_rate ?? "",
        gst_split_logic: data.gst_split_logic ?? "",
        revenue_gl: data.revenue_gl ?? "",
        gst_output_gl: data.gst_output_gl ?? "",
        gst_input_gl: data.gst_input_gl ?? "",
        receivables_gl: data.receivables_gl ?? "",
        late_fee_gl: data.late_fee_gl ?? "",
        interest_gl: data.interest_gl ?? "",
      }
    : null;

  const noop = () => {};

  return (
    <div>
      <PageHeader
        title={`Site Billing Config: ${siteName}`}
        backTo="/billing/site-config"
        actions={<Button variant="secondary" onClick={() => navigate(`/billing/site-config/${siteId}/edit`)}>Edit</Button>}
      />

      {data ? (
        <div className="space-y-6">
          {data.next_invoice_preview && (
            <Card className="p-4">
              <p className="text-sm text-gray-500">Next invoice number preview</p>
              <p className="text-lg font-mono text-gray-800">{data.next_invoice_preview}</p>
              <p className="text-xs text-gray-500 mt-1">Current counter: {data.current_counter}</p>
            </Card>
          )}

          <Card className="p-6">
            <NumberingSection form={formData} setForm={noop} readOnly />
          </Card>

          <Card className="p-6">
            <GenerationSection form={formData} setForm={noop} readOnly />
          </Card>

          <Card className="p-6">
            <PaymentTermsSection form={formData} setForm={noop} readOnly />
          </Card>

          <Card className="p-6">
            <TaxSection form={formData} setForm={noop} readOnly />
          </Card>

          <Card className="p-6">
            <LedgerSection form={formData} setForm={noop} readOnly />
          </Card>
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-gray-500">No billing config for this site. Create one to get started.</p>
          <Button className="mt-4" onClick={() => navigate(`/billing/site-config/create?site=${siteId}`)}>
            Create Config
          </Button>
        </Card>
      )}
    </div>
  );
}
