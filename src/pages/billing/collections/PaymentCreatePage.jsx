import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { paymentsAPI, invoicesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const PAYMENT_METHOD_OPTIONS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" },
];

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR – Indian Rupee" },
  { value: "USD", label: "USD – US Dollar" },
  { value: "EUR", label: "EUR – Euro" },
  { value: "GBP", label: "GBP – British Pound" },
  { value: "AED", label: "AED – UAE Dirham" },
  { value: "SGD", label: "SGD – Singapore Dollar" },
];

export default function PaymentCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInvoice = searchParams.get("invoice");
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    invoice: preselectedInvoice || "",
    payment_date: new Date().toISOString().slice(0, 10),
    amount: "",
    payment_method: "BANK_TRANSFER",
    currency: "INR",
    reference_number: "",
    bank_name: "",
    cheque_number: "",
    transaction_id: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    invoicesAPI.list().then((r) => setInvoices(r?.results || r || [])).catch(() => setInvoices([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        invoice: Number(form.invoice),
        payment_date: form.payment_date,
        amount: parseFloat(form.amount) || 0,
        payment_method: form.payment_method,
        currency: form.currency,
        status: "CONFIRMED",
        reference_number: form.reference_number || "",
        notes: form.notes || "",
      };
      if (form.bank_name) payload.bank_name = form.bank_name;
      if (form.cheque_number) payload.cheque_number = form.cheque_number;
      if (form.transaction_id) payload.transaction_id = form.transaction_id;

      const created = await paymentsAPI.create(payload);
      toast.success("Payment recorded");
      navigate(`/billing/collections/payments/${created.id}`);
    } catch (err) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const invoiceOptions = invoices.map((inv) => ({
    value: inv.id,
    label: `${inv.invoice_number || inv.id} - ${inv.tenant_name || ""} (${inv.total_amount ?? ""})`,
  }));

  const showBank = form.payment_method === "BANK_TRANSFER";
  const showCheque = form.payment_method === "CHEQUE";
  const showTransaction = form.payment_method === "BANK_TRANSFER" || form.payment_method === "UPI" || form.payment_method === "CARD";

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className={inModal ? "p-4 border-0 shadow-none" : "p-6"}>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Payment Details</h3>
        <div className="space-y-4">
          <Select label="Invoice" value={form.invoice} onChange={set("invoice")} options={invoiceOptions} placeholder="Select invoice" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Amount" type="number" min={0.01} step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" required />
            <Input label="Payment Date" type="date" value={form.payment_date} onChange={set("payment_date")} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Payment Method" value={form.payment_method} onChange={set("payment_method")} options={PAYMENT_METHOD_OPTIONS} required />
            <Select label="Currency" value={form.currency} onChange={set("currency")} options={CURRENCY_OPTIONS} />
          </div>
          <Input label="Reference Number" value={form.reference_number} onChange={set("reference_number")} placeholder="Optional" />

          {/* Conditional bank / cheque / transaction fields */}
          {(showBank || showCheque) && (
            <Input label="Bank Name" value={form.bank_name} onChange={set("bank_name")} placeholder="e.g. HDFC Bank" />
          )}
          {showCheque && (
            <Input label="Cheque Number" value={form.cheque_number} onChange={set("cheque_number")} placeholder="e.g. 012345" />
          )}
          {showTransaction && (
            <Input label="Transaction ID / UTR" value={form.transaction_id} onChange={set("transaction_id")} placeholder="e.g. UTR123456789" />
          )}

          <Input label="Notes" value={form.notes} onChange={set("notes")} placeholder="Optional" />
        </div>
      </Card>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" type="button" onClick={() => navigate("/billing/collections/payments")}>Cancel</Button>
        <Button type="submit" loading={loading}>Record Payment</Button>
      </div>
    </form>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Record Payment" backTo="/billing/collections/payments" />
      {formContent}
    </div>
  );
}
