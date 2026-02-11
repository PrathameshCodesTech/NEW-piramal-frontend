import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Badge from "../../../../../components/ui/Badge";
import { statusColor } from "../constants";

export default function ReviewActionsTab({
  data,
  updatingStatus,
  onSubmit,
  onActivate,
  onTerminate,
  onRefresh,
}) {
  return (
    <Card className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-4">
        <Badge color={statusColor(data.status)}>{data.status}</Badge>
        <Badge color="blue">{data.agreement_type}</Badge>
        <span className="text-xs text-gray-500">Version v{data.version_number}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500">Tenant</p>
          <p className="text-sm font-medium">{data.tenant_name || data.tenant_details?.legal_name || "-"}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500">Site</p>
          <p className="text-sm font-medium">{data.site_name || data.site_details?.name || "-"}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500">Total Area</p>
          <p className="text-sm font-medium">{data.total_allocated_area || 0}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500">Monthly Rent (Total)</p>
          <p className="text-sm font-medium">{Number(data.total_monthly_rent || 0).toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500">Notes</p>
          <p className="text-sm font-medium">{(data.notes_list || []).length}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-500">Documents</p>
          <p className="text-sm font-medium">{(data.documents || []).length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.status === "DRAFT" && (
          <Button loading={updatingStatus} onClick={onSubmit}>
            Submit
          </Button>
        )}
        {data.status === "PENDING" && (
          <Button loading={updatingStatus} onClick={onActivate}>
            Activate
          </Button>
        )}
        {data.status === "ACTIVE" && (
          <Button variant="danger" loading={updatingStatus} onClick={onTerminate}>
            Terminate
          </Button>
        )}
        <Button variant="secondary" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </Card>
  );
}

