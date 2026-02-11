import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { siteBillingConfigAPI, sitesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

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

  return (
    <div>
      <PageHeader
        title={`Site Billing Config: ${siteName}`}
        backTo="/billing/site-config"
        actions={<Button variant="secondary" onClick={() => navigate(`/billing/site-config/${siteId}/edit`)}>Edit</Button>}
      />
      <Card className="p-6 max-w-2xl">
        {data ? (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500">Invoice Pattern</dt><dd>{data.invoice_pattern}</dd></div>
            <div><dt className="text-gray-500">Generation Mode</dt><dd>{data.generation_mode}</dd></div>
            <div><dt className="text-gray-500">Payment Term</dt><dd>{data.default_payment_term}</dd></div>
            <div><dt className="text-gray-500">Current Counter</dt><dd>{data.current_counter}</dd></div>
          </dl>
        ) : (
          <p className="text-gray-500">No billing config for this site.</p>
        )}
      </Card>
    </div>
  );
}
