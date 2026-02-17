import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { entitiesAPI } from "../../../services/api";
import { useOrgStructureBasePath } from "../../../contexts/OrgStructureContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

export default function EntityViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useOrgStructureBasePath();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => { entitiesAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false)); }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await entitiesAPI.delete(id); toast.success("Entity deleted"); navigate(`${basePath}/entities`); } catch (err) { toast.error(err.message); } finally { setDeleting(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Entity not found</div>;

  const fields = [["Name", data.name], ["Company", data.company_name || data.company], ["Legal Name", data.legal_name], ["Registration No.", data.registration_number], ["Tax ID", data.tax_id], ["Address", data.address], ["City", data.city], ["State", data.state], ["Country", data.country]];

  return (
    <div>
      <PageHeader title={data.name} subtitle="Entity Details" backTo={`${basePath}/entities`} actions={<div className="flex gap-2"><Button variant="secondary" icon={Pencil} onClick={() => navigate(`${basePath}/entities/${id}/edit`)}>Edit</Button><Button variant="danger" icon={Trash2} onClick={() => setShowDelete(true)}>Delete</Button></div>} />
      <Card className="p-6 max-w-2xl">
        <div className="mb-6"><Badge color={data.is_active ? "emerald" : "red"}>{data.is_active ? "Active" : "Inactive"}</Badge></div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map(([label, value]) => (<div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd></div>))}
        </dl>
      </Card>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Entity" message={`Delete "${data.name}"?`} loading={deleting} />
    </div>
  );
}
