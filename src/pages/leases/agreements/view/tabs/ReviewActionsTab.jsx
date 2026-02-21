import { CheckCircle2, Circle, Clock, XCircle, ChevronRight } from "lucide-react";
import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Badge from "../../../../../components/ui/Badge";
import { statusColor } from "../constants";

const LIFECYCLE_STEPS = [
  { key: "DRAFT", label: "Draft", description: "Being prepared" },
  { key: "PENDING", label: "Under Review", description: "Submitted for approval" },
  { key: "ACTIVE", label: "Active", description: "Executed & running" },
  { key: "END", label: "Closed", description: "Expired or terminated" },
];

const stepIndex = (status) => {
  if (status === "DRAFT") return 0;
  if (status === "PENDING") return 1;
  if (status === "ACTIVE") return 2;
  if (status === "EXPIRED" || status === "TERMINATED") return 3;
  return 0;
};

function LifecyclePipeline({ status }) {
  const current = stepIndex(status);
  const isTerminated = status === "TERMINATED";

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide">Lease Lifecycle</p>
      <div className="flex items-center gap-0">
        {LIFECYCLE_STEPS.map((step, i) => {
          const isDone = i < current;
          const isActive = i === current;
          const isClosed = step.key === "END";
          const isTerminatedStep = isClosed && isTerminated;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mb-1 transition-colors ${
                  isActive && isTerminatedStep
                    ? "border-red-500 bg-red-50 text-red-600"
                    : isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : isDone
                    ? "border-emerald-400 bg-emerald-400 text-white"
                    : "border-gray-300 bg-white text-gray-300"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isActive && (status === "EXPIRED" || status === "TERMINATED") ? (
                    <XCircle className="w-4 h-4" />
                  ) : isActive ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <p className={`text-xs font-medium text-center ${
                  isActive && isTerminatedStep ? "text-red-600" : isActive ? "text-emerald-700" : isDone ? "text-emerald-600" : "text-gray-400"
                }`}>
                  {isClosed && isTerminated ? "Terminated" : isClosed && status === "EXPIRED" ? "Expired" : step.label}
                </p>
                <p className="text-[10px] text-gray-400 text-center hidden sm:block">{step.description}</p>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <ChevronRight className={`w-4 h-4 shrink-0 mx-0.5 ${isDone || isActive ? "text-emerald-400" : "text-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
      <LifecyclePipeline status={data.status} />

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
            Submit for Review
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
