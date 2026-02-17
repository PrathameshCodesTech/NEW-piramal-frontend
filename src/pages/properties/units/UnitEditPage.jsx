import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DoorOpen, Hash, Maximize2, LayoutGrid, IndianRupee, FileText } from "lucide-react";
import { unitsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const UNIT_TYPES = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "WAREHOUSE", label: "Warehouse" },
];

const UNIT_STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "LEASED", label: "Leased" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "HOLD", label: "Hold" },
];

export default function UnitEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    unit_no: "", unit_type: "COMMERCIAL", status: "AVAILABLE",
    builtup_area_sqft: "", leasable_area_sqft: "",
    base_rent_default: "", cam_default: "", security_deposit_default: "",
    layout_notes: "",
    is_divisible: false, min_divisible_area_sqft: "",
  });

  useEffect(() => {
    unitsAPI.get(id).then((res) => {
      setForm({
        unit_no: res.unit_no || "",
        unit_type: res.unit_type || "COMMERCIAL",
        status: res.status || "AVAILABLE",
        builtup_area_sqft: res.builtup_area_sqft ?? "",
        leasable_area_sqft: res.leasable_area_sqft ?? "",
        base_rent_default: res.base_rent_default ?? "",
        cam_default: res.cam_default ?? "",
        security_deposit_default: res.security_deposit_default ?? "",
        layout_notes: res.layout_notes || "",
        is_divisible: res.is_divisible || false,
        min_divisible_area_sqft: res.min_divisible_area_sqft ?? "",
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setBool = (field) => (e) => setForm({ ...form, [field]: e.target.checked });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      ["builtup_area_sqft", "leasable_area_sqft", "base_rent_default", "cam_default", "security_deposit_default", "min_divisible_area_sqft"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      await unitsAPI.update(id, payload);
      toast.success("Unit updated");
      navigate(-1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title={`Edit Unit: ${form.unit_no || ""}`} backTo={null} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Unit Info */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <DoorOpen className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Unit Info</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Unit No" icon={Hash} value={form.unit_no} onChange={set("unit_no")} required />
            <Select label="Unit Type" value={form.unit_type} onChange={set("unit_type")} options={UNIT_TYPES} required />
            <Select label="Status" value={form.status} onChange={set("status")} options={UNIT_STATUSES} />
            <Input label="Built-up Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.builtup_area_sqft} onChange={set("builtup_area_sqft")} required />
            <Input label="Leasable Area (sqft)" icon={LayoutGrid} type="number" step="0.01" value={form.leasable_area_sqft} onChange={set("leasable_area_sqft")} required />
          </div>
        </div>

        {/* Financials */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Financials</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Base Rent (per sqft)" icon={IndianRupee} type="number" step="0.01" value={form.base_rent_default} onChange={set("base_rent_default")} />
            <Input label="CAM Default (per sqft)" icon={IndianRupee} type="number" step="0.01" value={form.cam_default} onChange={set("cam_default")} />
            <Input label="Security Deposit Default" icon={IndianRupee} type="number" step="0.01" value={form.security_deposit_default} onChange={set("security_deposit_default")} />
          </div>
        </div>

        {/* Additional */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Additional</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Layout Notes" icon={FileText} value={form.layout_notes} onChange={set("layout_notes")} />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_divisible} onChange={setBool("is_divisible")} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              Unit is divisible (can be partially leased)
            </label>
          </div>
          {form.is_divisible && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <Input label="Min Divisible Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.min_divisible_area_sqft} onChange={set("min_divisible_area_sqft")} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
