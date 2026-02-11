import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { scopesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

const typeColors = { ORG: "emerald", COMPANY: "blue", ENTITY: "purple", SITE: "amber" };

export default function ScopeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => { scopesAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false)); }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await scopesAPI.delete(id); toast.success("Scope deleted"); navigate("/admin/scopes"); } catch (err) { toast.error(err.message); } finally { setDeleting(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Scope not found</div>;

  const fields = [["ID", data.id], ["Name", data.name], ["Scope Type", data.scope_type], ["Org", data.org_name || data.org || "—"], ["Company", data.company_name || data.company || "—"], ["Entity", data.entity_name || data.entity || "—"]];

  return (
    <div>
      <PageHeader title={data.name} subtitle="Scope Details" backTo="/admin/scopes" actions={<Button variant="danger" icon={Trash2} onClick={() => setShowDelete(true)}>Delete</Button>} />
      <Card className="p-6 max-w-2xl">
        <div className="flex gap-2 mb-6">
          <Badge color={typeColors[data.scope_type] || "gray"}>{data.scope_type}</Badge>
          <Badge color={data.is_active ? "emerald" : "red"}>{data.is_active ? "Active" : "Inactive"}</Badge>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map(([label, value]) => (<div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd></div>))}
        </dl>
      </Card>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Scope" message={`Delete scope "${data.name}"?`} loading={deleting} />
    </div>
  );
}
