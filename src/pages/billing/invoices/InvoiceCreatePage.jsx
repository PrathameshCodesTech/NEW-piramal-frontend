import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { invoicesAPI, agreementsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const INVOICE_TYPE_OPTIONS = [
  { value: "RENT", label: "Rent" },
  { value: "CAM", label: "CAM" },
  { value: "DEPOSIT", label: "Security Deposit" },
  { value: "UTILITY", label: "Utility" },
  { value: "LATE_FEE", label: "Late Fee" },
  { value: "INTEREST", label: "Interest" },
  { value: "OTHER", label: "Other" },
];

const DEFAULT_FORM = {
  agreement: "",
  invoice_type: "RENT",
  invoice_date: "",
  due_date: "",
  subtotal: "",
  tax_rate: "18",
  notes: "",
};

export default function InvoiceCreatePage({ inModal = false }) {
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

  const subtotal = parseFloat(form.subtotal) || 0;
  const taxRate = parseFloat(form.tax_rate) || 0;
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        agreement: Number(form.agreement),
        invoice_type: form.invoice_type,
        status: "DRAFT",
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: "INR",
        notes: form.notes || "",
      };
      const created = await invoicesAPI.create(payload);
      toast.success("Invoice created");
      navigate(`/billing/invoices/${created.id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => {
    setForm((prev) => ({ ...prev, [f]: e.target.value }));
  };

  const agreementOptions = agreements.map((a) => ({
    value: a.id,
    label: a.lease_id ? `${a.lease_id}${a.tenant_name ? ` - ${a.tenant_name}` : ""}` : `Agreement #${a.id}`,
  }));

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Details</h3>
          <div className="space-y-4">
            <Select
              label="Agreement"
              value={form.agreement}
              onChange={set("agreement")}
              options={agreementOptions}
              placeholder="Select agreement"
              required
            />
            <Select
              label="Invoice Type"
              value={form.invoice_type}
              onChange={set("invoice_type")}
              options={INVOICE_TYPE_OPTIONS}
              placeholder="Select type"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Invoice Date" type="date" value={form.invoice_date} onChange={set("invoice_date")} required />
              <Input label="Due Date" type="date" value={form.due_date} onChange={set("due_date")} required />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Amounts</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Subtotal"
                type="number"
                min={0}
                step="0.01"
                value={form.subtotal}
                onChange={set("subtotal")}
                placeholder="0.00"
                required
              />
              <Input
                label="Tax Rate (%)"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.tax_rate}
                onChange={set("tax_rate")}
                placeholder="18"
              />
            </div>
            <div className="text-sm text-gray-600">
              Tax: {taxAmount.toFixed(2)} · Total: {totalAmount.toFixed(2)}
            </div>
            <Input label="Notes" value={form.notes} onChange={set("notes")} placeholder="Optional notes" />
          </div>
        </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={() => navigate("/billing/invoices")}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Invoice
        </Button>
      </div>
    </form>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Create Invoice" backTo="/billing/invoices" />
      {formContent}
    </div>
  );
}
