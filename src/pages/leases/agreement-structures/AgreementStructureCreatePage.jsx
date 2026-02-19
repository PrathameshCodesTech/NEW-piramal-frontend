import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LayoutList, Info } from "lucide-react";
import { agreementStructuresAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function AgreementStructureCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    is_default: false,
  });

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
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || "",
        is_default: !!form.is_default,
      };
      const created = await agreementStructuresAPI.create(payload);
      toast.success("Structure created");
      navigate(`/leases/agreement-structures/${created.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Agreement Structure"
        backTo="/leases/agreement-structures"
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
            onClick={() => navigate("/leases/agreement-structures")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Structure
          </Button>
        </div>
      </form>
    </div>
  );
}
