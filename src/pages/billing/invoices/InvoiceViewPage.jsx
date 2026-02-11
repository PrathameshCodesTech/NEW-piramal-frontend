import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { invoicesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";

export default function InvoiceViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    invoicesAPI.get(id).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [id]);

  const handleSend = async () => {
    try {
      await invoicesAPI.send(id);
      toast.success("Invoice sent");
      invoicesAPI.get(id).then(setData);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDispute = async () => {
    const reason = window.prompt("Dispute reason?");
    if (reason === null) return;
    try {
      await invoicesAPI.dispute(id, reason);
      toast.success("Invoice marked as disputed");
      invoicesAPI.get(id).then(setData);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResolveDispute = async () => {
    try {
      await invoicesAPI.resolveDispute(id);
      toast.success("Dispute resolved");
      invoicesAPI.get(id).then(setData);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return <div className="text-center py-12 text-gray-500">Invoice not found</div>;

  return (
    <div>
      <PageHeader
        title={data.invoice_number}
        subtitle={data.invoice_type}
        backTo="/billing/invoices"
        actions={
          <div className="flex gap-2">
            {data.status === "DRAFT" && <Button size="sm" onClick={handleSend}>Send</Button>}
            {!data.is_disputed && data.status !== "PAID" && <Button variant="secondary" size="sm" onClick={handleDispute}>Dispute</Button>}
            {data.is_disputed && <Button size="sm" onClick={handleResolveDispute}>Resolve Dispute</Button>}
            <Button variant="secondary" onClick={() => navigate(`/billing/invoices/${id}/edit`)}>Edit</Button>
          </div>
        }
      />
      <Card className="p-6 max-w-2xl">
        <div className="flex gap-2 mb-4">
          <Badge color={data.status === "PAID" ? "emerald" : "amber"}>{data.status}</Badge>
          {data.is_disputed && <Badge color="red">Disputed</Badge>}
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Invoice #</dt><dd>{data.invoice_number}</dd></div>
          <div><dt className="text-gray-500">Type</dt><dd>{data.invoice_type}</dd></div>
          <div><dt className="text-gray-500">Date</dt><dd>{data.invoice_date}</dd></div>
          <div><dt className="text-gray-500">Due Date</dt><dd>{data.due_date}</dd></div>
          <div><dt className="text-gray-500">Total</dt><dd>{data.total_amount}</dd></div>
          <div><dt className="text-gray-500">Balance Due</dt><dd>{data.balance_due}</dd></div>
        </dl>
        {data.line_items?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">Line Items</h4>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Description</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {data.line_items.map((li, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2">{li.description}</td>
                    <td className="text-right">{li.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
