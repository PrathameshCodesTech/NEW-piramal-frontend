import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { TrendingUp, Info } from "lucide-react";
import { escalationTemplatesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

export default function EscalationTemplateViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTemplate = useCallback(async () => {
    setLoading(true);
    try { setData(await escalationTemplatesAPI.get(id)); }
    catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchTemplate(); }, [fetchTemplate]);

  const runAction = async (action, message) => {
    setActionLoading(true);
    try { await action(id); toast.success(message); await fetchTemplate(); }
    catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await escalationTemplatesAPI.delete(id); toast.success("Template deleted"); navigate("/leases/escalation-templates"); }
    catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Template not found.</div>;

  return (
    <div>
      <PageHeader
        title={data.name}
        subtitle="Escalation Template"
        backTo="/leases/escalation-templates"
        actions={
          <div className="flex gap-2">
            {data.status !== "ACTIVE" && (
              <Button size="sm" loading={actionLoading} onClick={() => runAction(escalationTemplatesAPI.activate, "Activated")}>Activate</Button>
            )}
            {data.status !== "ARCHIVED" && (
              <Button size="sm" variant="secondary" loading={actionLoading} onClick={() => runAction(escalationTemplatesAPI.archive, "Archived")}>Archive</Button>
            )}
            <Button size="sm" variant="secondary" loading={actionLoading} onClick={() => runAction(escalationTemplatesAPI.clone, "Template cloned")}>Clone</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/leases/escalation-templates/${id}/edit`)}>Edit</Button>
            <Button size="sm" variant="danger" loading={actionLoading} onClick={handleDelete}>Delete</Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge color={data.status === "ACTIVE" ? "emerald" : data.status === "DRAFT" ? "amber" : "gray"}>{data.status}</Badge>
          <Badge color="blue">{data.escalation_type}</Badge>
          <Badge color="purple">{data.frequency}</Badge>
        </div>

        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Template Details</h4>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {[
              ["Applicability", data.applicability],
              ["Escalation %", data.escalation_percentage],
              ["Index Name", data.index_name],
              ["Index Base Value", data.index_base_value],
              ["First Escalation (Months)", data.first_escalation_months],
              ["Rounding Rule", data.rounding_rule],
              ["Cap %", data.cap_percentage],
              ["Floor %", data.floor_percentage],
              ["Apply to CAM", data.apply_to_cam ? "Yes" : "No"],
              ["Apply to Parking", data.apply_to_parking ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium text-gray-500">{label}</dt>
                <dd className="text-sm text-gray-800 mt-0.5">{value ?? "-"}</dd>
              </div>
            ))}
          </dl>
          {Array.isArray(data.step_schedule) && data.step_schedule.length > 0 && (
            <div className="mt-4">
              <dt className="text-xs font-medium text-gray-500 mb-1">Step Schedule</dt>
              <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">
                {JSON.stringify(data.step_schedule, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {data.description && (
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Description</h4>
            </div>
            <p className="text-sm text-gray-700">{data.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
