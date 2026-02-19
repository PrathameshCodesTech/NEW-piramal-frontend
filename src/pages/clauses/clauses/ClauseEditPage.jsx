import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clausesAPI, clauseCategoriesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "INACTIVE", label: "Inactive" },
];

const APPLIES_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "RESIDENTIAL", label: "Residential" },
];

export default function ClauseEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    applies_to: "ALL",
    status: "DRAFT",
  });

  useEffect(() => {
    Promise.all([clausesAPI.get(id), clauseCategoriesAPI.list()])
      .then(([clause, catRes]) => {
        setForm({
          title: clause.title || "",
          category: String(clause.category || clause.category_detail?.id || ""),
          applies_to: clause.applies_to || "ALL",
          status: clause.status || "DRAFT",
        });
        setCategories(catRes?.results || catRes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Only PATCH metadata columns — body_text and config live on ClauseVersion,
      // not on the Clause model. Use "Bump Version" on the view page to update those.
      await clausesAPI.update(id, {
        title: form.title,
        category: parseInt(form.category, 10),
        applies_to: form.applies_to,
        status: form.status,
      });
      toast.success("Clause updated");
      navigate(`/clauses/clauses/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <div>
      <PageHeader title="Edit Clause" backTo={`/clauses/clauses/${id}`} />
      <Card className="p-6 max-w-xl">
        <div className="border-l-2 border-blue-400 pl-4 py-1 mb-5">
          <p className="text-sm font-medium text-gray-700">Editing metadata only</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Title, category, applicability and status. To update clause body or legal config (renewal, termination, etc.), use <strong>Bump Version</strong> on the view page — this creates a proper version record.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={set("title")} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={set("category")} options={categoryOptions} required />
            <Select label="Applies To" value={form.applies_to} onChange={set("applies_to")} options={APPLIES_OPTIONS} />
            <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(`/clauses/clauses/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
