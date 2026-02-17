import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { billingRulesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

const CATEGORY_OPTIONS = [
  { value: "RENTAL", label: "Rental" },
  { value: "CONTRACT", label: "Contract" },
  { value: "SERVICE", label: "Service" },
  { value: "UTILITY", label: "Utility" },
];

const APPLIES_OPTIONS = [
  { value: "LEASE", label: "Lease" },
  { value: "PROPERTY", label: "Property" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function BillingRuleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    billingRulesAPI.get(id).then((data) => {
      setForm({
        name: data.name || "",
        description: data.description || "",
        category: data.category || "RENTAL",
        applies_to: data.applies_to || "LEASE",
        status: data.status || "DRAFT",
      });
    }).catch(() => setForm(null));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    try {
      await billingRulesAPI.update(id, form);
      toast.success("Billing rule updated");
      navigate(`/billing/rules/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Edit Billing Rule" backTo={`/billing/rules/${id}`} />
      <Card className="p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORY_OPTIONS} />
          <Select label="Applies To" value={form.applies_to} onChange={(e) => setForm({ ...form, applies_to: e.target.value })} options={APPLIES_OPTIONS} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate(`/billing/rules/${id}`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
