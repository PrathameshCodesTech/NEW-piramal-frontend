import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clausesAPI, clauseCategoriesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

const STATUS_OPTIONS = [{ value: "DRAFT", label: "Draft" }, { value: "ACTIVE", label: "Active" }];
const APPLIES_OPTIONS = [{ value: "ALL", label: "All" }, { value: "COMMERCIAL", label: "Commercial" }, { value: "RESIDENTIAL", label: "Residential" }];

export default function ClauseCreatePage({ inModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    applies_to: "ALL",
    status: "DRAFT",
    initial_body_text: "",
    initial_change_summary: "Initial version",
  });

  useEffect(() => {
    clauseCategoriesAPI.list().then((r) => setCategories(r?.results || r || [])).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        category: parseInt(form.category, 10),
        applies_to: form.applies_to,
        status: form.status,
        initial_body_text: form.initial_body_text || "",
        initial_change_summary: form.initial_change_summary || "Initial version",
      };
      const res = await clausesAPI.create(payload);
      toast.success("Clause created");
      navigate(`/clauses/clauses/${res.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  const formContent = (
    <Card className={inModal ? "p-0 border-0 shadow-none" : "p-6 max-w-3xl"}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Title" value={form.title} onChange={set("title")} required />
            </div>
            <Select label="Category" value={form.category} onChange={set("category")} options={categoryOptions} required />
            <Select label="Applies To" value={form.applies_to} onChange={set("applies_to")} options={APPLIES_OPTIONS} />
            <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clause Body</label>
            <textarea value={form.initial_body_text} onChange={set("initial_body_text")} rows={10} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-y" placeholder="Enter the clause text..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/clauses/clauses")}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Clause</Button>
          </div>
        </form>
    </Card>
  );

  if (inModal) return formContent;
  return (
    <div>
      <PageHeader title="Create Clause" backTo="/clauses/clauses" />
      {formContent}
    </div>
  );
}
