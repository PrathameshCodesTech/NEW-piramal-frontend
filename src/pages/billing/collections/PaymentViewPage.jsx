import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { paymentsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";

export default function PaymentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reversing, setReversing] = useState(false);

  useEffect(() => {
    setLoading(true);
    paymentsAPI.get(id).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [id]);

  const handleReverse = async () => {
    if (!window.confirm("Reverse this payment? This will update the invoice balance.")) return;
    setReversing(true);
    try {
      await paymentsAPI.reverse(id);
      toast.success("Payment reversed");
      paymentsAPI.get(id).then(setData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReversing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return <div className="text-center py-12 text-gray-500">Payment not found</div>;

  const inv = data.invoice_details;

  return (
    <div>
      <PageHeader
        title={data.payment_number}
        subtitle={data.payment_method}
        backTo="/billing/collections/payments"
        actions={
          data.status === "CONFIRMED" && (
            <Button variant="secondary" onClick={handleReverse} loading={reversing}>
              Reverse Payment
            </Button>
          )
        }
      />
      <Card className="p-6 max-w-2xl">
        <div className="flex gap-2 mb-4">
          <Badge color={data.status === "CONFIRMED" ? "emerald" : data.status === "REVERSED" ? "red" : "gray"}>{data.status}</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Payment #</dt><dd>{data.payment_number}</dd></div>
          <div><dt className="text-gray-500">Amount</dt><dd>{data.amount}</dd></div>
          <div><dt className="text-gray-500">Date</dt><dd>{data.payment_date}</dd></div>
          <div><dt className="text-gray-500">Method</dt><dd>{data.payment_method}</dd></div>
          <div><dt className="text-gray-500">Reference</dt><dd>{data.reference_number || "—"}</dd></div>
          <div><dt className="text-gray-500">Currency</dt><dd>{data.currency ?? "INR"}</dd></div>
          {data.notes && <div className="col-span-2"><dt className="text-gray-500">Notes</dt><dd>{data.notes}</dd></div>}
        </dl>
        {inv && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Invoice</h4>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">#{inv.invoice_number}</span>
              <span>·</span>
              <span>Total: {inv.total_amount}</span>
              <span>·</span>
              <span>Balance: {inv.balance_due}</span>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/billing/invoices/${inv.id}`)}>
                View Invoice
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
