import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { billingRulesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

export default function BillingRuleViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    setLoading(true);
    billingRulesAPI
      .get(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await billingRulesAPI.delete(id);
      toast.success("Rule deleted");
      navigate("/billing/rules");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async () => {
    try {
      await billingRulesAPI.activate(id);
      setData((d) => (d ? { ...d, status: "ACTIVE" } : null));
      toast.success("Rule activated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeactivate = async () => {
    try {
      await billingRulesAPI.deactivate(id);
      setData((d) => (d ? { ...d, status: "INACTIVE" } : null));
      toast.success("Rule deactivated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleClone = async () => {
    try {
      const res = await billingRulesAPI.clone(id);
      toast.success("Rule cloned");
      navigate(`/billing/rules/${res.id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) {
    return <div className="text-center py-12 text-gray-500">Rule not found</div>;
  }

  return (
    <div>
      <PageHeader
        title={data.name}
        subtitle={data.rule_id}
        backTo="/billing/rules"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleClone}>Clone</Button>
            {data.status === "ACTIVE" ? (
              <Button variant="secondary" size="sm" onClick={handleDeactivate}>Deactivate</Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleActivate}>Activate</Button>
            )}
            <Button variant="secondary" onClick={() => navigate(`/billing/rules/${id}/edit`)}>Edit</Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        }
      />
      <Card className="p-6 max-w-2xl">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Rule ID</dt><dd>{data.rule_id}</dd></div>
          <div><dt className="text-gray-500">Name</dt><dd>{data.name}</dd></div>
          <div><dt className="text-gray-500">Category</dt><dd>{data.category}</dd></div>
          <div><dt className="text-gray-500">Applies To</dt><dd>{data.applies_to}</dd></div>
          <div><dt className="text-gray-500">Status</dt><dd><Badge color={data.status === "ACTIVE" ? "emerald" : "gray"}>{data.status}</Badge></dd></div>
          {data.description && (
            <div className="col-span-2"><dt className="text-gray-500">Description</dt><dd>{data.description}</dd></div>
          )}
        </dl>
      </Card>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Rule" message={`Delete "${data.name}"?`} loading={deleting} />
    </div>
  );
}
