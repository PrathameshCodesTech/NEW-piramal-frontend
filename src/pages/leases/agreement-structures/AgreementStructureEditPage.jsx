import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { LayoutList, Info } from "lucide-react";
import { agreementStructuresAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function AgreementStructureEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    is_default: false,
  });

  useEffect(() => {
    agreementStructuresAPI
      .get(id)
      .then((data) => {
        setForm({
          name: data.name || "",
          description: data.description || "",
          is_default: !!data.is_default,
        });
      })
      .catch(() => navigate("/leases/agreement-structures"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setChecked = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await agreementStructuresAPI.update(id, {
        name: form.name.trim(),
        description: form.description || "",
        is_default: !!form.is_default,
      });
      toast.success("Structure updated");
      navigate(`/leases/agreement-structures/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Edit Agreement Structure"
        backTo={`/leases/agreement-structures/${id}`}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <LayoutList className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Structure Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Name"
              icon={LayoutList}
              value={form.name}
              onChange={set("name")}
              required
              placeholder="e.g. Standard Commercial Lease"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={setChecked("is_default")}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Use as default for new agreements
            </label>
          </div>
        </div>

        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Description</h4>
          </div>
          <textarea
            rows={3}
            value={form.description}
            onChange={set("description")}
            placeholder="Describe this structure..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate(`/leases/agreement-structures/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
