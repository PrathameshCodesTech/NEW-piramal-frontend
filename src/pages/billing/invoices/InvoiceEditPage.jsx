import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function toForm(data) {
  if (!data) return null;
  const sub = parseFloat(data.subtotal);
  const tax = parseFloat(data.tax_amount || 0);
  const taxRate = sub > 0 ? ((tax / sub) * 100).toFixed(2) : "18";
  return {
    agreement: data.agreement?.id ?? data.agreement ?? "",
    invoice_type: data.invoice_type ?? "RENT",
    invoice_date: data.invoice_date ?? "",
    due_date: data.due_date ?? "",
    subtotal: data.subtotal ?? "",
    tax_rate: taxRate,
    notes: data.notes ?? "",
  };
}

export default function InvoiceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      invoicesAPI.get(id),
      agreementsAPI.list().then((r) => r?.results || r || []),
    ]).then(([inv, aggs]) => {
      setData(inv);
      setForm(toForm(inv));
      setAgreements(aggs);
    }).catch(() => setData(null));
  }, [id]);

  const subtotal = parseFloat(form?.subtotal) || 0;
  const taxRate = parseFloat(form?.tax_rate) || 0;
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    if (data?.status !== "DRAFT") {
      toast.error("Only draft invoices can be edited");
      return;
    }
    setLoading(true);
    try {
      await invoicesAPI.update(id, {
        agreement: Number(form.agreement),
        invoice_type: form.invoice_type,
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: form.notes || "",
      });
      toast.success("Invoice updated");
      navigate(`/billing/invoices/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  if (data === null && !form) return <div className="text-center py-12 text-gray-500">Invoice not found</div>;
  if (!form) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (data?.status !== "DRAFT") {
    return (
      <div>
        <PageHeader title="Edit Invoice" backTo={`/billing/invoices/${id}`} />
        <Card className="p-6"><p className="text-gray-600">Only draft invoices can be edited. Current status: {data?.status}</p></Card>
      </div>
    );
  }

  const agreementOptions = agreements.map((a) => ({
    value: a.id,
    label: a.lease_id ? `${a.lease_id}${a.tenant_name ? " - " + a.tenant_name : ""}` : "Agreement #" + a.id,
  }));

  return (
    <div>
      <PageHeader title="Edit Invoice" backTo={`/billing/invoices/${id}`} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Details</h3>
          <div className="space-y-4">
            <Select label="Agreement" value={form.agreement} onChange={set("agreement")} options={agreementOptions} required />
            <Select label="Invoice Type" value={form.invoice_type} onChange={set("invoice_type")} options={INVOICE_TYPE_OPTIONS} required />
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
              <Input label="Subtotal" type="number" min={0} step="0.01" value={form.subtotal} onChange={set("subtotal")} required />
              <Input label="Tax Rate (%)" type="number" min={0} max={100} step="0.01" value={form.tax_rate} onChange={set("tax_rate")} />
            </div>
            <div className="text-sm text-gray-600">Tax: {taxAmount.toFixed(2)} | Total: {totalAmount.toFixed(2)}</div>
            <Input label="Notes" value={form.notes} onChange={set("notes")} />
          </div>
        </Card>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate(`/billing/invoices/${id}`)}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
