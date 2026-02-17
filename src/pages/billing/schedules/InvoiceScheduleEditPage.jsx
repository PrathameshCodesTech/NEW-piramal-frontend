import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { invoiceSchedulesAPI, agreementsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import AgreementSection from "./sections/AgreementSection";
import BasicInfoSection from "./sections/BasicInfoSection";
import AmountSection from "./sections/AmountSection";
import ScheduleSection from "./sections/ScheduleSection";

function toForm(data) {
  if (!data) return null;
  return {
    agreement: data.agreement?.id ?? data.agreement ?? "",
    schedule_name: data.schedule_name ?? "",
    invoice_type: data.invoice_type ?? "RENT",
    frequency: data.frequency ?? "MONTHLY",
    amount: data.amount ?? "",
    tax_rate: data.tax_rate ?? "18",
    start_date: data.start_date ?? "",
    end_date: data.end_date ?? "",
    day_of_month: data.day_of_month ?? "1",
    generate_days_before: data.generate_days_before ?? "0",
  };
}

export default function InvoiceScheduleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      invoiceSchedulesAPI.get(id),
      agreementsAPI.list().then((r) => r?.results || r || []),
    ]).then(([schedule, aggs]) => {
      setData(schedule);
      setForm(toForm(schedule));
      setAgreements(aggs);
    }).catch(() => setData(null));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    try {
      const payload = {
        agreement: Number(form.agreement),
        schedule_name: form.schedule_name,
        invoice_type: form.invoice_type,
        frequency: form.frequency,
        amount: parseFloat(form.amount) || 0,
        tax_rate: parseFloat(form.tax_rate) || 18,
        start_date: form.start_date,
        end_date: form.end_date || null,
        day_of_month: parseInt(form.day_of_month, 10) || 1,
        generate_days_before: parseInt(form.generate_days_before, 10) || 0,
      };
      await invoiceSchedulesAPI.update(id, payload);
      toast.success("Schedule updated");
      navigate(`/billing/schedules/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (data === null && !form) {
    return <div className="text-center py-12 text-gray-500">Schedule not found</div>;
  }
  if (!form) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit Invoice Schedule" backTo={`/billing/schedules/${id}`} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <AgreementSection form={form} setForm={setForm} agreements={agreements} readOnly={false} />
        </Card>

        <Card className="p-6">
          <BasicInfoSection form={form} setForm={setForm} readOnly={false} />
        </Card>

        <Card className="p-6">
          <AmountSection form={form} setForm={setForm} readOnly={false} />
        </Card>

        <Card className="p-6">
          <ScheduleSection form={form} setForm={setForm} readOnly={false} />
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate(`/billing/schedules/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
