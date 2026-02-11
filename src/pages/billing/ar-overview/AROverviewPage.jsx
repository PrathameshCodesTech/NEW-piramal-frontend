import { useState, useEffect } from "react";
import { arSummariesAPI } from "../../../services/api";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { BarChart3 } from "lucide-react";

export default function AROverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    arSummariesAPI.overall().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <EmptyState icon={BarChart3} title="No AR data" description="Create invoices to see AR overview" />;
  }

  return (
    <Card className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Total Invoiced</p>
          <p className="text-lg font-semibold">{Number(data.total_invoiced || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Total Paid</p>
          <p className="text-lg font-semibold">{Number(data.total_paid || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className="text-lg font-semibold text-amber-600">{Number(data.total_outstanding || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-lg font-semibold text-red-600">{Number(data.total_overdue || 0).toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Overdue Count</p>
          <p className="text-lg font-semibold">{data.overdue_count || 0}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Disputed</p>
          <p className="text-lg font-semibold">{data.disputed_count || 0}</p>
        </div>
      </div>
    </Card>
  );
}
