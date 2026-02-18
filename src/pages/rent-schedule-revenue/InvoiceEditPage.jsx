import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Receipt, Calendar, Plus, Trash2 } from "lucide-react";
import { invoicesAPI, agreementsAPI } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const BASE_PATH = "/rent-schedule-revenue/invoice";

const INVOICE_TYPE_OPTIONS = [
  { value: "RENT", label: "Rent" },
  { value: "CAM", label: "CAM" },
  { value: "DEPOSIT", label: "Security Deposit" },
  { value: "UTILITY", label: "Utility" },
  { value: "LATE_FEE", label: "Late Fee" },
  { value: "INTEREST", label: "Interest" },
  { value: "OTHER", label: "Other" },
];

const DEFAULT_LINE_ITEM = {
  item_type: "BASE_RENT",
  description: "",
  period_start: "",
  period_end: "",
  quantity: "1",
  unit_price: "",
  tax_rate: "18",
};

function computeLineAmount(row) {
  const qty = parseFloat(row.quantity) || 0;
  const up = parseFloat(row.unit_price) || 0;
  const rate = parseFloat(row.tax_rate) || 0;
  const amount = qty * up;
  const tax = amount * (rate / 100);
  return { amount, tax, total: amount + tax };
}

function toLineItem(li) {
  return {
    item_type: li.item_type || "BASE_RENT",
    description: li.description || "",
    period_start: li.period_start || "",
    period_end: li.period_end || "",
    quantity: String(li.quantity ?? 1),
    unit_price: String(li.unit_price ?? ""),
    tax_rate: String(li.tax_rate ?? 18),
  };
}

export default function InvoiceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [form, setForm] = useState({
    agreement: "",
    invoice_type: "RENT",
    invoice_date: "",
    due_date: "",
    currency: "INR",
    reference_po: "",
    notes: "",
  });
  const [lineItems, setLineItems] = useState([{ ...DEFAULT_LINE_ITEM }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      invoicesAPI.get(id),
      agreementsAPI.list().then((r) => r?.results || r || []),
    ])
      .then(([inv, aggs]) => {
        setData(inv);
        setAgreements(aggs);
        setForm({
          agreement: String(inv.agreement?.id ?? inv.agreement ?? ""),
          invoice_type: inv.invoice_type ?? "RENT",
          invoice_date: inv.invoice_date ?? "",
          due_date: inv.due_date ?? "",
          currency: inv.currency ?? "INR",
          reference_po: "",
          notes: inv.notes ?? "",
        });
        const items = inv.line_items?.length
          ? inv.line_items.map(toLineItem)
          : [{ ...DEFAULT_LINE_ITEM }];
        setLineItems(items);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const { subtotal, taxAmount } = lineItems.reduce(
    (acc, row) => {
      const { amount, tax } = computeLineAmount(row);
      acc.subtotal += amount;
      acc.taxAmount += tax;
      return acc;
    },
    { subtotal: 0, taxAmount: 0 }
  );
  const totalAmountFinal = subtotal + taxAmount;

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const setLineItem = (idx, field) => (e) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: e.target.value };
      return next;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { ...DEFAULT_LINE_ITEM }]);
  };

  const removeLineItem = (idx) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data?.status !== "DRAFT") {
      toast.error("Only draft invoices can be edited");
      return;
    }
    const validItems = lineItems.filter((r) => r.description.trim() && parseFloat(r.unit_price) > 0);
    if (validItems.length === 0) {
      toast.error("Add at least one line item with description and amount");
      return;
    }

    setSaving(true);
    try {
      const lineItemsPayload = validItems.map((r) => ({
        item_type: r.item_type,
        description: r.description.trim(),
        quantity: parseFloat(r.quantity) || 1,
        unit_price: parseFloat(r.unit_price) || 0,
        tax_rate: parseFloat(r.tax_rate) || 0,
        period_start: r.period_start || null,
        period_end: r.period_end || null,
      }));

      await invoicesAPI.update(id, {
        agreement: Number(form.agreement),
        invoice_type: form.invoice_type,
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        period_start: null,
        period_end: null,
        subtotal: Math.round(subtotal * 100) / 100,
        tax_amount: Math.round(taxAmount * 100) / 100,
        total_amount: Math.round(totalAmountFinal * 100) / 100,
        currency: form.currency || "INR",
        notes: form.notes || "",
        line_items: lineItemsPayload,
      });
      toast.success("Invoice updated");
      navigate(`${BASE_PATH}/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (data === null && loading)
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!data) return <div className="text-center py-12 text-gray-500">Invoice not found</div>;
  if (data?.status !== "DRAFT") {
    return (
      <div>
        <PageHeader title="Edit Invoice" backTo={`${BASE_PATH}/${id}`} />
        <div className="border-l-2 border-emerald-500 pl-5 py-6 pr-5 rounded-r-lg bg-gray-50">
          <p className="text-gray-600">
            Only draft invoices can be edited. Current status: <strong>{data.status}</strong>
          </p>
        </div>
      </div>
    );
  }

  const agreementOptions = agreements.map((a) => ({
    value: String(a.id),
    label: a.lease_id ? `${a.lease_id}${a.tenant_name ? " - " + a.tenant_name : ""}` : "Agreement #" + a.id,
  }));

  return (
    <div>
      <PageHeader title="Edit Invoice" backTo={`${BASE_PATH}/${id}`} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Invoice Header</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Agreement / Property / Tenant"
              value={form.agreement}
              onChange={set("agreement")}
              options={agreementOptions}
              placeholder="Select agreement"
              required
            />
            <Input label="Invoice Date" type="date" icon={Calendar} value={form.invoice_date} onChange={set("invoice_date")} required />
            <Input label="Due Date" type="date" icon={Calendar} value={form.due_date} onChange={set("due_date")} required />
            <Select label="Invoice Type" value={form.invoice_type} onChange={set("invoice_type")} options={INVOICE_TYPE_OPTIONS} />
            <Input label="Currency" value={form.currency} onChange={set("currency")} placeholder="INR" />
            <Input label="Reference / PO" value={form.reference_po} onChange={set("reference_po")} placeholder="Optional" />
          </div>
        </div>

        {/* Line Items */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Line Items</h4>
            </div>
            <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addLineItem}>
              Add Line
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Description</th>
                  <th className="text-left py-2 font-medium text-gray-500">Period From</th>
                  <th className="text-left py-2 font-medium text-gray-500">Period To</th>
                  <th className="text-right py-2 font-medium text-gray-500 w-20">Qty</th>
                  <th className="text-right py-2 font-medium text-gray-500 w-24">Unit Price</th>
                  <th className="text-right py-2 font-medium text-gray-500 w-20">Tax %</th>
                  <th className="text-right py-2 font-medium text-gray-500 w-24">Amount</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {lineItems.map((row, idx) => {
                  const { total } = computeLineAmount(row);
                  return (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2">
                        <input
                          type="text"
                          value={row.description}
                          onChange={setLineItem(idx, "description")}
                          placeholder="Description"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-2">
                        <input type="date" value={row.period_start} onChange={setLineItem(idx, "period_start")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                      </td>
                      <td className="py-2">
                        <input type="date" value={row.period_end} onChange={setLineItem(idx, "period_end")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                      </td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.quantity}
                          onChange={setLineItem(idx, "quantity")}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.unit_price}
                          onChange={setLineItem(idx, "unit_price")}
                          placeholder="0"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <input type="number" min="0" max="100" step="0.01" value={row.tax_rate} onChange={setLineItem(idx, "tax_rate")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right" />
                      </td>
                      <td className="py-2 text-right font-medium">₹{total.toFixed(2)}</td>
                      <td className="py-2">
                        <button type="button" onClick={() => removeLineItem(idx)} className="p-1 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
            <div className="text-sm space-y-1 text-right">
              <p>Subtotal: <span className="font-medium">₹{subtotal.toFixed(2)}</span></p>
              <p>Tax: <span className="font-medium">₹{taxAmount.toFixed(2)}</span></p>
              <p className="text-base font-semibold">Total: <span>₹{totalAmountFinal.toFixed(2)}</span></p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Notes</h4>
          </div>
          <Input label="Notes" value={form.notes} onChange={set("notes")} placeholder="Optional notes" />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate(`${BASE_PATH}/${id}`)}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
