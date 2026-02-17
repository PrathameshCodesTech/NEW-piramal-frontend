import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { creditRulesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";

export default function CreditRuleViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    creditRulesAPI.get(id).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [id]);

  const refresh = () => creditRulesAPI.get(id).then(setData);

  const handleActivate = async () => {
    try {
      await creditRulesAPI.activate(id);
      toast.success("Rule activated");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeactivate = async () => {
    try {
      await creditRulesAPI.deactivate(id);
      toast.success("Rule deactivated");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading && !data) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Rule not found</div>;

  return (
    <div>
      <PageHeader title={data.name} subtitle={data.trigger_display} backTo="/billing/credit-rules" actions={
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/billing/credit-rules/${id}/edit`)}>Edit</Button>
          {data.status === "ACTIVE" ? <Button variant="secondary" size="sm" onClick={handleDeactivate}>Deactivate</Button> : <Button size="sm" onClick={handleActivate}>Activate</Button>}
        </div>
      } />
      <Card className="p-6 max-w-2xl">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Name</dt><dd>{data.name}</dd></div>
          <div><dt className="text-gray-500">Status</dt><dd><Badge color={data.status === "ACTIVE" ? "emerald" : "gray"}>{data.status}</Badge></dd></div>
          <div><dt className="text-gray-500">Trigger</dt><dd>{data.trigger_display}</dd></div>
          <div><dt className="text-gray-500">Approval Level</dt><dd>{data.approval_level}</dd></div>
          <div><dt className="text-gray-500">Auto Approve</dt><dd>{data.auto_approve ? "Yes" : "No"}</dd></div>
          {data.description && <div className="col-span-2"><dt className="text-gray-500">Description</dt><dd>{data.description}</dd></div>}
        </dl>
      </Card>
    </div>
  );
}
