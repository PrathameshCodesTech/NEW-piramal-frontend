import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { creditNotesAPI, invoicesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const REASON_OPTIONS = [
  { value: "BILLING_ERROR", label: "Billing Error" },
  { value: "RATE_ADJUSTMENT", label: "Rate Adjustment" },
  { value: "GOODWILL", label: "Goodwill" },
  { value: "SERVICE_ISSUE", label: "Service Issue" },
  { value: "EARLY_TERMINATION", label: "Early Termination" },
  { value: "PAYMENT_VARIANCE", label: "Payment Variance" },
  { value: "OTHER", label: "Other" },
];

export default function CreditNoteCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInvoice = searchParams.get("invoice");
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    invoice: preselectedInvoice || "",
    credit_note_date: new Date().toISOString().slice(0, 10),
    amount: "",
    reason: "BILLING_ERROR",
    reason_details: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    invoicesAPI.list().then((r) => setInvoices(r?.results || r || [])).catch(() => setInvoices([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await creditNotesAPI.create({
        invoice: Number(form.invoice),
        credit_note_date: form.credit_note_date,
        amount: parseFloat(form.amount) || 0,
        reason: form.reason,
        reason_details: form.reason_details || "",
        status: "DRAFT",
      });
      toast.success("Credit note created");
      navigate(`/billing/collections/credit-notes/${created.id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create credit note");
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const invoiceOptions = invoices.map((inv) => ({
    value: inv.id,
    label: `${inv.invoice_number || inv.id} - ${inv.tenant_name || ""} (${inv.total_amount ?? ""})`,
  }));

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className={inModal ? "p-4 border-0 shadow-none" : "p-6"}>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Credit Note Details</h3>
        <div className="space-y-4">
          <Select label="Invoice" value={form.invoice} onChange={set("invoice")} options={invoiceOptions} placeholder="Select invoice" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Amount" type="number" min={0.01} step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" required />
            <Input label="Credit Note Date" type="date" value={form.credit_note_date} onChange={set("credit_note_date")} required />
          </div>
          <Select label="Reason" value={form.reason} onChange={set("reason")} options={REASON_OPTIONS} required />
          <Input label="Reason Details" value={form.reason_details} onChange={set("reason_details")} placeholder="Optional" />
        </div>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={() => navigate("/billing/collections/credit-notes")}>Cancel</Button>
        <Button type="submit" loading={loading}>Create Credit Note</Button>
      </div>
    </form>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Create Credit Note" backTo="/billing/collections/credit-notes" />
      {formContent}
    </div>
  );
}
