import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { invoiceSchedulesAPI, agreementsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import AgreementSection from "./sections/AgreementSection";
import BasicInfoSection from "./sections/BasicInfoSection";
import AmountSection from "./sections/AmountSection";
import ScheduleSection from "./sections/ScheduleSection";

const DEFAULT_FORM = {
  agreement: "",
  schedule_name: "",
  invoice_type: "RENT",
  frequency: "MONTHLY",
  amount: "",
  tax_rate: "18",
  start_date: "",
  end_date: "",
  day_of_month: "1",
  generate_days_before: "0",
};

export default function InvoiceScheduleCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAgreement = searchParams.get("agreement");
  const [agreements, setAgreements] = useState([]);
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    agreement: preselectedAgreement || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    agreementsAPI.list().then((r) => setAgreements(r?.results || r || [])).catch(() => setAgreements([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await invoiceSchedulesAPI.create(payload);
      toast.success("Invoice schedule created");
      navigate("/billing/schedules");
    } catch (err) {
      toast.error(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className={inModal ? "p-4 border-0 shadow-none" : "p-6"}>
        <AgreementSection form={form} setForm={setForm} agreements={agreements} readOnly={false} />
      </Card>

      <Card className={inModal ? "p-4 border-0 shadow-none" : "p-6"}>
        <BasicInfoSection form={form} setForm={setForm} readOnly={false} />
      </Card>

      <Card className={inModal ? "p-4 border-0 shadow-none" : "p-6"}>
        <AmountSection form={form} setForm={setForm} readOnly={false} />
      </Card>

      <Card className={inModal ? "p-4 border-0 shadow-none" : "p-6"}>
        <ScheduleSection form={form} setForm={setForm} readOnly={false} />
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={() => navigate("/billing/schedules")}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Schedule
        </Button>
      </div>
    </form>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Create Invoice Schedule" backTo="/billing/schedules" />
      {formContent}
    </div>
  );
}
