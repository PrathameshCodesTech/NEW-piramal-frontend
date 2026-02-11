import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building, Hash, Layers, Maximize2, LayoutGrid, Calendar } from "lucide-react";
import { towersAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const BUILDING_TYPES = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "MIXED", label: "Mixed" },
  { value: "OFFICE", label: "Office" },
  { value: "RETAIL", label: "Retail" },
  { value: "WAREHOUSE", label: "Warehouse" },
];

export default function TowerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteId, setSiteId] = useState(null);
  const [form, setForm] = useState({
    name: "", code: "", building_type: "",
    total_floors: "", total_area_sqft: "", leasable_area_sqft: "",
    completion_date: "", occupancy_date: "",
  });

  useEffect(() => {
    towersAPI.get(id).then((res) => {
      setSiteId(res.site);
      setForm({
        name: res.name || "",
        code: res.code || "",
        building_type: res.building_type || "",
        total_floors: res.total_floors ?? "",
        total_area_sqft: res.total_area_sqft ?? "",
        leasable_area_sqft: res.leasable_area_sqft ?? "",
        completion_date: res.completion_date || "",
        occupancy_date: res.occupancy_date || "",
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      ["total_floors", "total_area_sqft", "leasable_area_sqft"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      ["completion_date", "occupancy_date"].forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      await towersAPI.update(id, payload);
      toast.success("Tower updated");
      navigate(`/properties/sites/${siteId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Edit Tower" backTo={`/properties/sites/${siteId}`} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tower Details */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Tower Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Tower Name" icon={Building} value={form.name} onChange={set("name")} required />
            <Input label="Code" icon={Hash} value={form.code} onChange={set("code")} required />
            <Select label="Building Type" value={form.building_type} onChange={set("building_type")} options={BUILDING_TYPES} />
            <Input label="Total Floors" icon={Layers} type="number" value={form.total_floors} onChange={set("total_floors")} />
          </div>
        </div>

        {/* Area & Dates */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Maximize2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Area & Dates</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Total Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.total_area_sqft} onChange={set("total_area_sqft")} required />
            <Input label="Leasable Area (sqft)" icon={LayoutGrid} type="number" step="0.01" value={form.leasable_area_sqft} onChange={set("leasable_area_sqft")} required />
            <Input label="Completion Date" icon={Calendar} type="date" value={form.completion_date} onChange={set("completion_date")} />
            <Input label="Occupancy Date" icon={Calendar} type="date" value={form.occupancy_date} onChange={set("occupancy_date")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate(`/properties/sites/${siteId}`)}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
