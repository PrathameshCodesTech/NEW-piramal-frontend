import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, Mail, DollarSign, FileText, Upload, Loader2 } from "lucide-react";
import {
  invoicesAPI,
  invoiceAttachmentsAPI,
  paymentsAPI,
  creditNotesAPI,
} from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const BASE_PATH = "/rent-schedule-revenue/invoice";

const TABS = [
  { key: "line-items", label: "Line Items", icon: FileText },
  { key: "payments", label: "Payments", icon: DollarSign },
  { key: "credit-note", label: "Credit Note", icon: FileText },
  { key: "notes", label: "Notes", icon: FileText },
  { key: "attachments", label: "Attachments", icon: FileText },
];

function formatAmount(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function InvoiceViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("line-items");
  const [attachUploading, setAttachUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const loadInvoice = () => {
    setLoading(true);
    invoicesAPI
      .get(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "attachments") {
      invoiceAttachmentsAPI
        .list({ invoice_id: id })
        .then((r) => setAttachments(Array.isArray(r) ? r : r?.results || []))
        .catch(() => setAttachments([]));
    }
  }, [id, activeTab]);

  const handleSend = async () => {
    try {
      await invoicesAPI.send(id);
      toast.success("Invoice sent");
      loadInvoice();
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
      loadInvoice();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResolveDispute = async () => {
    try {
      await invoicesAPI.resolveDispute(id);
      toast.success("Dispute resolved");
      loadInvoice();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachUploading(true);
    try {
      await invoiceAttachmentsAPI.create(id, file);
      toast.success("Attachment uploaded");
      const r = await invoiceAttachmentsAPI.list({ invoice_id: id });
      setAttachments(Array.isArray(r) ? r : r?.results || []);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setAttachUploading(false);
    }
  };

  const handleDownloadAttachment = (att) => {
    invoiceAttachmentsAPI
      .download(att.id)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = att.filename || "attachment";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error("Download failed"));
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }
  if (!data)
    return <div className="text-center py-12 text-gray-500">Invoice not found</div>;

  return (
    <div>
      <PageHeader
        title={data.invoice_number || `Invoice #${id}`}
        subtitle={data.invoice_type}
        backTo={BASE_PATH}
        actions={
          <div className="flex flex-wrap gap-2">
            {data.status === "DRAFT" && (
              <Button size="sm" onClick={handleSend}>
                Send
              </Button>
            )}
            {data.status !== "PAID" && parseFloat(data.balance_due) > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={() => navigate(`/billing/collections/payments/create?invoice=${id}`)}
                >
                  Record Payment
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/billing/collections/credit-notes/create?invoice=${id}`)}
                >
                  Credit Note
                </Button>
              </>
            )}
            {!data.is_disputed && data.status !== "PAID" && (
              <Button variant="secondary" size="sm" onClick={handleDispute}>
                Dispute
              </Button>
            )}
            {data.is_disputed && (
              <Button size="sm" onClick={handleResolveDispute}>
                Resolve Dispute
              </Button>
            )}
            {data.status === "DRAFT" && (
              <Button variant="secondary" size="sm" onClick={() => navigate(`${BASE_PATH}/${id}/edit`)}>
                Edit
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={Download}>
              Download PDF
            </Button>
            <Button variant="secondary" size="sm" icon={Mail}>
              Email Invoice
            </Button>
          </div>
        }
      />

      {/* Invoice Header - Tenant-style */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Invoice Details</h4>
          <Badge color={data.status === "PAID" ? "emerald" : data.status === "OVERDUE" || data.status === "DISPUTED" ? "red" : "amber"} className="ml-2">
            {data.status}
          </Badge>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          {[
            ["Issue Date", data.invoice_date],
            ["Due Date", data.due_date],
            ["Bill To", data.bill_to],
            ["Invoice Type", data.invoice_type],
            ["Currency", data.currency || "INR"],
            ["Total Amount", formatAmount(data.total_amount)],
            ["Amount Paid", formatAmount(data.amount_paid)],
            ["Balance Due", formatAmount(data.balance_due)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-gray-500">{label}</dt>
              <dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "line-items" && (
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          {data.line_items?.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Description</th>
                  <th className="text-right py-2 font-medium text-gray-500">Period</th>
                  <th className="text-right py-2 font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.line_items.map((li, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3">{li.description || "—"}</td>
                    <td className="text-right">
                      {li.period_start && li.period_end ? `${li.period_start} to ${li.period_end}` : "—"}
                    </td>
                    <td className="text-right">{formatAmount(li.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No line items</p>
          )}
          <div className="mt-4 pt-4 border-t flex justify-end gap-4 text-sm">
            <span>Subtotal: {formatAmount(data.subtotal)}</span>
            <span>Tax: {formatAmount(data.tax_amount)}</span>
            <span className="font-semibold">Total: {formatAmount(data.total_amount)}</span>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          {data.payments?.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 font-medium text-gray-500">Reference</th>
                  <th className="text-right py-2 font-medium text-gray-500">Amount</th>
                  <th className="text-left py-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-3">{p.payment_date}</td>
                    <td>{p.reference || p.reference_number || "—"}</td>
                    <td className="text-right">{formatAmount(p.amount)}</td>
                    <td>
                      <Badge color={p.status === "CONFIRMED" ? "emerald" : "gray"}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No payments recorded</p>
          )}
          <div className="mt-4">
            <Button size="sm" onClick={() => navigate(`/billing/collections/payments/create?invoice=${id}`)}>
              Record Payment
            </Button>
          </div>
        </div>
      )}

      {activeTab === "credit-note" && (
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          {data.credit_notes?.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Credit Note</th>
                  <th className="text-left py-2 font-medium text-gray-500">Reason</th>
                  <th className="text-right py-2 font-medium text-gray-500">Amount</th>
                  <th className="text-left py-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.credit_notes.map((cn) => (
                  <tr key={cn.id} className="border-b border-gray-100">
                    <td className="py-3">{cn.credit_note_number || cn.id}</td>
                    <td>{cn.reason || "—"}</td>
                    <td className="text-right">{formatAmount(cn.applied_amount ?? cn.amount)}</td>
                    <td>
                      <Badge color={cn.status === "APPLIED" ? "emerald" : "amber"}>{cn.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No credit notes</p>
          )}
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/billing/collections/credit-notes/create?invoice=${id}`)}>
              Create Credit Note
            </Button>
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.notes || "No notes"}</p>
        </div>
      )}

      {activeTab === "attachments" && (
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-gray-800">Attachments</h4>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleUploadAttachment}
                disabled={attachUploading}
              />
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ${
                  attachUploading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {attachUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {attachUploading ? "Uploading..." : "Upload"}
              </span>
            </label>
          </div>
          {attachments.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Filename</th>
                  <th className="text-right py-2 font-medium text-gray-500">Size</th>
                  <th className="text-right py-2 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map((att) => (
                  <tr key={att.id} className="border-b border-gray-100">
                    <td className="py-3">{att.filename || "—"}</td>
                    <td className="text-right">{att.file_size ? `${(att.file_size / 1024).toFixed(1)} KB` : "—"}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(att)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No attachments. Upload files to attach to this invoice.</p>
          )}
        </div>
      )}
    </div>
  );
}
