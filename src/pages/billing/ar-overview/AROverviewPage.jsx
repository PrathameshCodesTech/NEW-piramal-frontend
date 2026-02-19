import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { arSummariesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { BarChart3 } from "lucide-react";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

export default function AROverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    arSummariesAPI.overall().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="AR Overview" />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="AR Overview" />
        <EmptyState icon={BarChart3} title="No AR data" description="Create invoices to see AR overview" />
      </div>
    );
  }

  const ageing = data.ageing || {};

  return (
    <div className="space-y-4">
      <PageHeader title="AR Overview" />

      {/* Primary stats */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Total Invoiced</p>
            <p className="text-lg font-semibold">{fmt(data.total_invoiced)}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="text-lg font-semibold text-emerald-700">{fmt(data.total_paid)}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-lg font-semibold text-amber-600">{fmt(data.total_outstanding)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-xs text-gray-500">Overdue</p>
            <p className="text-lg font-semibold text-red-600">{fmt(data.total_overdue)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Overdue Count</p>
            <p className="text-lg font-semibold">{data.overdue_count || 0}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-500">Disputed Amount</p>
            <p className="text-lg font-semibold text-orange-600">{fmt(data.disputed_amount)}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-500">Disputed Count</p>
            <p className="text-lg font-semibold text-orange-600">{data.disputed_count || 0}</p>
          </div>
        </div>
        {(data.overdue_count > 0 || data.disputed_count > 0) && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {data.overdue_count > 0 && (
              <Link to="/billing/invoices?overdue=true" className="text-amber-600 hover:underline">
                View overdue invoices ({data.overdue_count})
              </Link>
            )}
            {data.disputed_count > 0 && (
              <Link to="/billing/invoices?status=DISPUTED" className="text-orange-600 hover:underline">
                View disputed invoices ({data.disputed_count})
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Ageing buckets */}
      {(ageing.current != null || ageing["30_60"] != null || ageing["60_90"] != null || ageing["90_plus"] != null) && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ageing Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-xs text-gray-500">Current (0–30 days)</p>
              <p className="text-lg font-semibold text-emerald-700">{fmt(ageing.current)}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-500">30–60 days</p>
              <p className="text-lg font-semibold text-yellow-700">{fmt(ageing["30_60"])}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-500">60–90 days</p>
              <p className="text-lg font-semibold text-orange-600">{fmt(ageing["60_90"])}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-xs text-gray-500">90+ days</p>
              <p className="text-lg font-semibold text-red-600">{fmt(ageing["90_plus"])}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
