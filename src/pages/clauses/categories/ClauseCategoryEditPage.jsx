import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clauseCategoriesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function ClauseCategoryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    sort_order: "0",
    parent: "",
  });

  useEffect(() => {
    Promise.all([clauseCategoriesAPI.get(id), clauseCategoriesAPI.list()])
      .then(([category, catRes]) => {
        const list = catRes?.results || catRes || [];
        setForm({
          name: category.name || "",
          description: category.description || "",
          sort_order: String(category.sort_order ?? 0),
          parent: category.parent ? String(category.parent) : "",
        });
        setCategories(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clauseCategoriesAPI.update(id, {
        name: form.name,
        description: form.description || null,
        sort_order: parseInt(form.sort_order, 10) || 0,
        parent: form.parent ? parseInt(form.parent, 10) : null,
      });
      toast.success("Category updated");
      navigate(`/clauses/categories/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = [
    { value: "", label: "None (Top Level)" },
    ...categories
      .filter((c) => String(c.id) !== String(id))
      .map((c) => ({ value: String(c.id), label: c.name })),
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit Category" backTo={`/clauses/categories/${id}`} />
      <Card className="p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Category Name" value={form.name} onChange={set("name")} required />
          <Input label="Description" value={form.description} onChange={set("description")} />
          <Select label="Parent Category" value={form.parent} onChange={set("parent")} options={parentOptions} />
          <Input label="Sort Order" type="number" value={form.sort_order} onChange={set("sort_order")} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(`/clauses/categories/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
