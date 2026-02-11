import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

export default function TowerCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get("site");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", code: "", building_type: "COMMERCIAL",
    total_floors: "", total_area_sqft: "", leasable_area_sqft: "",
    completion_date: "", occupancy_date: "",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!siteId) { toast.error("Site ID missing"); return; }
    setLoading(true);
    try {
      const payload = { ...form, site: siteId };
      ["total_floors", "total_area_sqft", "leasable_area_sqft"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      ["completion_date", "occupancy_date"].forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      await towersAPI.create(payload);
      toast.success("Tower created");
      navigate(`/properties/sites/${siteId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Tower" backTo={`/properties/sites/${siteId}`} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tower Details */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Tower Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Tower Name" icon={Building} value={form.name} onChange={set("name")} required />
            <Input label="Code" icon={Hash} value={form.code} onChange={set("code")} required placeholder="e.g. tower-a" />
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
          <Button type="submit" loading={loading}>Create Tower</Button>
        </div>
      </form>
    </div>
  );
}
