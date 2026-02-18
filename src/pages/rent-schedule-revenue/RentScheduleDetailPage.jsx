import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Calendar, DollarSign, Receipt } from "lucide-react";
import { rentSchedulesAPI } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const BASE_PATH = "/rent-schedule-revenue";

function formatAmount(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function RentScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rentSchedulesAPI
      .get(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!data) return <div className="text-center py-12 text-gray-500">Rent schedule line not found</div>;

  const statusColor = data.status === "PAID" ? "emerald" : data.status === "INVOICED" ? "blue" : data.status === "CANCELLED" ? "gray" : "amber";

  return (
    <div>
      <PageHeader
        title={`Schedule #${data.id}`}
        subtitle={`${data.period_start} to ${data.period_end}`}
        backTo={`${BASE_PATH}/rent-schedules`}
        actions={
          data.invoice && (
            <Button size="sm" onClick={() => navigate(`${BASE_PATH}/invoice/${data.invoice}`)}>
              View Invoice
            </Button>
          )
        }
      />

      <div className="space-y-6">
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Schedule Details</h4>
            <Badge color={statusColor}>{data.status}</Badge>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {[
              ["Lease ID", data.lease_id],
              ["Tenant", data.tenant_name],
              ["Property", data.site_name],
              ["Unit", data.unit_label],
              ["Period", data.period_start && data.period_end ? `${data.period_start} to ${data.period_end}` : null],
              ["Charge Type", data.charge_type?.replace("_", " ")],
              ["Due Date", data.due_date],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium text-gray-500">{label}</dt>
                <dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Calculated Amounts</h4>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {[
              ["Amount Before Tax", formatAmount(data.amount_before_tax)],
              ["GST", formatAmount(data.gst)],
              ["Amount After Tax", formatAmount(data.amount_after_tax)],
              ["Override Amount", data.override_amount != null ? formatAmount(data.override_amount) : "—"],
              ["Adjustment Reason", data.adjustment_reason || "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium text-gray-500">{label}</dt>
                <dd className="text-sm text-gray-800 mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Linked Invoice</h4>
          </div>
          {data.invoice ? (
            <p className="text-sm">
              <button
                type="button"
                onClick={() => navigate(`${BASE_PATH}/invoice/${data.invoice}`)}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Invoice #{data.invoice_number || data.invoice}
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-500">No linked invoice</p>
          )}
        </div>

        {(data.escalation_applied || data.escalation_notes || data.notes) && (
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Notes</h4>
            </div>
            <dl className="space-y-2">
              {data.escalation_applied && <dd className="text-sm text-gray-700">Escalation applied: Yes</dd>}
              {data.escalation_notes && <dd className="text-sm text-gray-700">{data.escalation_notes}</dd>}
              {data.notes && <dd className="text-sm text-gray-700 whitespace-pre-wrap">{data.notes}</dd>}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
