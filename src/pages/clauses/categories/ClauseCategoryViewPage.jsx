import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { clauseCategoriesAPI, clausesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import DataTable from "../../../components/ui/DataTable";

export default function ClauseCategoryViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    clauseCategoriesAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (data) clausesAPI.list({ category: id }).then((r) => setClauses(r?.results || r || [])).catch(() => setClauses([]));
  }, [data, id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clauseCategoriesAPI.delete(id);
      toast.success("Category deleted");
      navigate("/clauses/categories");
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Category not found</div>;

  const columns = [{ key: "clause_id", label: "ID" }, { key: "title", label: "Title" }];

  return (
    <div>
      <PageHeader
        title={data.name}
        subtitle="Category"
        backTo="/clauses/categories"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/clauses/categories/${id}/edit`)}>Edit</Button>
            <Button variant="danger" icon={Trash2} onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        }
      />
      <div className="max-w-2xl space-y-4">
        <Card className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {[["Name", data.name], ["Description", data.description], ["Sort Order", data.sort_order ?? "—"], ["Parent", data.parent_name || data.parent_detail?.name || "None"], ["Created", data.created_at ? new Date(data.created_at).toLocaleDateString() : "—"], ["Updated", data.updated_at ? new Date(data.updated_at).toLocaleDateString() : "—"]].map(([label, value]) => (
              <div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd></div>
            ))}
          </dl>
        </Card>
        {clauses.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Clauses in this category</h3>
            <DataTable columns={columns} data={clauses} onRowClick={(r) => navigate(`/clauses/clauses/${r.id}`)} />
          </Card>
        )}
      </div>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Category" message={`Are you sure you want to delete "${data.name}"? This cannot be undone.`} loading={deleting} />
    </div>
  );
}
