import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { invoiceSchedulesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

export default function InvoiceScheduleViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setLoading(true);
    invoiceSchedulesAPI.get(id).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await invoiceSchedulesAPI.generate(id);
      toast.success("Invoice generated");
      setLoading(true);
      invoiceSchedulesAPI.get(id).then(setData).finally(() => setLoading(false));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return <div className="text-center py-12 text-gray-500">Schedule not found</div>;

  return (
    <div>
      <PageHeader
        title={data.schedule_name}
        backTo="/billing/schedules"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/billing/schedules/${id}/edit`)}>
              Edit
            </Button>
            <Button onClick={handleGenerate} loading={generating}>Generate Now</Button>
          </div>
        }
      />
      <Card className="p-6 max-w-2xl">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Agreement</dt><dd>{data.agreement_lease_id ?? data.agreement ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Type</dt><dd>{data.invoice_type}</dd></div>
          <div><dt className="text-gray-500">Frequency</dt><dd>{data.frequency}</dd></div>
          <div><dt className="text-gray-500">Amount</dt><dd>{data.amount}</dd></div>
          <div><dt className="text-gray-500">Tax Rate</dt><dd>{data.tax_rate != null ? `${data.tax_rate}%` : "—"}</dd></div>
          <div><dt className="text-gray-500">Start Date</dt><dd>{data.start_date ?? "—"}</dd></div>
          <div><dt className="text-gray-500">End Date</dt><dd>{data.end_date ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Day of Month</dt><dd>{data.day_of_month ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Generate Days Before</dt><dd>{data.generate_days_before ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Last Generated</dt><dd>{data.last_generated_date ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Next Scheduled</dt><dd>{data.next_scheduled_date ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Active</dt><dd>{data.is_active ? "Yes" : "No"}</dd></div>
        </dl>
      </Card>
    </div>
  );
}
