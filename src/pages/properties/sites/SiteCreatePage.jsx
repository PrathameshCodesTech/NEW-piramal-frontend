import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Hash, MapPin, Landmark, Map, Navigation, Maximize2, LayoutGrid, IndianRupee, FileText, Info } from "lucide-react";
import { sitesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const SITE_TYPES = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "MIXED", label: "Mixed" },
];

const OWNERSHIP_TYPES = [
  { value: "OWN", label: "Own" },
  { value: "JOINT_VENTURE", label: "Joint Venture" },
  { value: "LEASED_IN", label: "Leased-In" },
];

const MGMT_FEE_TYPES = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "AMOUNT", label: "Amount" },
];

export default function SiteCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", code: "", site_type: "COMMERCIAL",
    address_line1: "", address_line2: "", landmark: "",
    city: "", state: "", country: "India", pincode: "",
    total_builtup_area_sqft: "", leasable_area_sqft: "",
    common_area_percent: "", common_area_sqft: "",
    base_rate_sqft: "",
    ownership_type: "OWN",
    management_fee_type: "PERCENTAGE", management_fee_value: "",
    contract_start_date: "", contract_end_date: "",
    description: "",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((p) => ({
      ...p,
      name,
      code: p.code || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      ["total_builtup_area_sqft", "leasable_area_sqft", "common_area_percent", "common_area_sqft", "base_rate_sqft", "management_fee_value"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      ["contract_start_date", "contract_end_date"].forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      const res = await sitesAPI.create(payload);
      toast.success("Site created");
      navigate(`/properties/sites/${res.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Site" backTo="/properties" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Basic Info</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Site Name" icon={Building2} value={form.name} onChange={handleNameChange} required />
            <Input label="Code" icon={Hash} value={form.code} onChange={set("code")} required placeholder="e.g. site-alpha" />
            <Select label="Site Type" value={form.site_type} onChange={set("site_type")} options={SITE_TYPES} required />
            <Select label="Ownership Type" value={form.ownership_type} onChange={set("ownership_type")} options={OWNERSHIP_TYPES} />
          </div>
        </div>

        {/* Address */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Address</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Address Line 1" icon={MapPin} value={form.address_line1} onChange={set("address_line1")} />
            <Input label="Address Line 2" icon={MapPin} value={form.address_line2} onChange={set("address_line2")} />
            <Input label="Landmark" icon={Landmark} value={form.landmark} onChange={set("landmark")} />
            <Input label="City" icon={Map} value={form.city} onChange={set("city")} />
            <Input label="State" icon={Map} value={form.state} onChange={set("state")} />
            <Input label="Country" icon={Map} value={form.country} onChange={set("country")} />
            <Input label="Pincode" icon={Navigation} value={form.pincode} onChange={set("pincode")} />
          </div>
        </div>

        {/* Area Details */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Maximize2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Area Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Total Built-up Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.total_builtup_area_sqft} onChange={set("total_builtup_area_sqft")} required />
            <Input label="Leasable Area (sqft)" icon={LayoutGrid} type="number" step="0.01" value={form.leasable_area_sqft} onChange={set("leasable_area_sqft")} required />
            <Input label="Common Area %" icon={Maximize2} type="number" step="0.01" value={form.common_area_percent} onChange={set("common_area_percent")} />
            <Input label="Common Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.common_area_sqft} onChange={set("common_area_sqft")} />
            <Input label="Base Rate (per sqft)" icon={IndianRupee} type="number" step="0.01" value={form.base_rate_sqft} onChange={set("base_rate_sqft")} />
          </div>
        </div>

        {/* Management & Contract */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Management & Contract</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Management Fee Type" value={form.management_fee_type} onChange={set("management_fee_type")} options={MGMT_FEE_TYPES} />
            <Input label="Management Fee Value" icon={IndianRupee} type="number" step="0.01" value={form.management_fee_value} onChange={set("management_fee_value")} />
            <Input label="Contract Start" type="date" value={form.contract_start_date} onChange={set("contract_start_date")} />
            <Input label="Contract End" type="date" value={form.contract_end_date} onChange={set("contract_end_date")} />
          </div>
        </div>

        {/* Description */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Description</h4>
          </div>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/properties")}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Site</Button>
        </div>
      </form>
    </div>
  );
}
