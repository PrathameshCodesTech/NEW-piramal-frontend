import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { creditNotesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";

export default function CreditNoteViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    setLoading(true);
    creditNotesAPI.get(id).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [id]);

  const refresh = () => {
    creditNotesAPI.get(id).then(setData);
  };

  const handleApprove = async () => {
    setActing(true);
    try {
      await creditNotesAPI.approve(id);
      toast.success("Credit note approved");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason === null) return;
    setActing(true);
    try {
      await creditNotesAPI.reject(id, reason);
      toast.success("Credit note rejected");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  const handleApply = async () => {
    if (!window.confirm("Apply this credit note to the invoice? This will reduce the invoice balance.")) return;
    setActing(true);
    try {
      await creditNotesAPI.apply(id);
      toast.success("Credit note applied");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return <div className="text-center py-12 text-gray-500">Credit note not found</div>;

  const inv = data.invoice_details;
  const isDraft = data.status === "DRAFT";
  const isPending = data.status === "PENDING_APPROVAL";
  const isApproved = data.status === "APPROVED";
  const canApprove = isDraft || isPending;
  const canApply = isApproved;

  return (
    <div>
      <PageHeader
        title={data.credit_note_number}
        subtitle={data.reason}
        backTo="/billing/collections/credit-notes"
        actions={
          <div className="flex gap-2">
            {canApprove && <Button size="sm" onClick={handleApprove} loading={acting}>Approve</Button>}
            {canApprove && <Button variant="secondary" size="sm" onClick={handleReject} loading={acting}>Reject</Button>}
            {canApply && <Button size="sm" onClick={handleApply} loading={acting}>Apply to Invoice</Button>}
          </div>
        }
      />
      <Card className="p-6 max-w-2xl">
        <div className="flex gap-2 mb-4">
          <Badge color={data.status === "APPLIED" ? "emerald" : data.status === "REJECTED" ? "red" : "gray"}>{data.status}</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Credit Note #</dt><dd>{data.credit_note_number}</dd></div>
          <div><dt className="text-gray-500">Amount</dt><dd>{data.amount}</dd></div>
          <div><dt className="text-gray-500">Date</dt><dd>{data.credit_note_date}</dd></div>
          <div><dt className="text-gray-500">Reason</dt><dd>{data.reason}</dd></div>
          <div><dt className="text-gray-500">Approved By</dt><dd>{data.approved_by_name ?? "—"}</dd></div>
          {data.reason_details && <div className="col-span-2"><dt className="text-gray-500">Reason Details</dt><dd>{data.reason_details}</dd></div>}
        </dl>
        {inv && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Invoice</h4>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">#{inv.invoice_number}</span>
              <span>·</span>
              <span>Total: {inv.total_amount}</span>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/billing/invoices/${inv.id}`)}>View Invoice</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
