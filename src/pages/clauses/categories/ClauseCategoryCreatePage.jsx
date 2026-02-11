import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clauseCategoriesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function ClauseCategoryCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    sort_order: "0",
    parent: "",
  });

  useEffect(() => {
    clauseCategoriesAPI.list().then((res) => setCategories(res?.results || res || [])).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clauseCategoriesAPI.create({
        name: form.name,
        description: form.description || null,
        sort_order: parseInt(form.sort_order, 10) || 0,
        parent: form.parent ? parseInt(form.parent, 10) : null,
      });
      toast.success("Category created");
      navigate("/clauses/categories");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parentOptions = [
    { value: "", label: "None (Top Level)" },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const formContent = (
    <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-lg"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Category Name" value={form.name} onChange={set("name")} required />
        <Input label="Description" value={form.description} onChange={set("description")} />
        <Select label="Parent Category" value={form.parent} onChange={set("parent")} options={parentOptions} />
        <Input label="Sort Order" type="number" value={form.sort_order} onChange={set("sort_order")} />
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/clauses/categories")}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Category
          </Button>
        </div>
      </form>
    </Card>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Create Category" backTo="/clauses/categories" />
      {formContent}
    </div>
  );
}
