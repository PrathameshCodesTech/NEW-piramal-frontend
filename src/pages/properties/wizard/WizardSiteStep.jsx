import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Building2, Hash, MapPin, Map, Navigation, Maximize2, LayoutGrid,
  FileText, Info, Landmark, ArrowLeft,
} from "lucide-react";
import { sitesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import SelectableDataView from "../../../components/ui/SelectableDataView";

const SITE_FIELDS = [
  { key: "name", label: "Name" },
  { key: "code", label: "Code" },
  { key: "site_type", label: "Type" },
  { key: "city", label: "City" },
  { key: "total_builtup_area_sqft", label: "Built-up (sqft)" },
  { key: "leasable_area_sqft", label: "Leasable (sqft)" },
  { key: "summary.towers_count", label: "Towers" },
  { key: "summary.floors_count", label: "Floors" },
  { key: "summary.units_count", label: "Units" },
  { key: "summary.occupancy_percent", label: "Occupancy %" },
];

const SITE_GRID_FIELDS = [
  "name",
  "code",
  "total_builtup_area_sqft",
  "leasable_area_sqft",
  "summary.towers_count",
];

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

export default function WizardSiteStep({ onSelected, onNext }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", code: "", site_type: "COMMERCIAL",
    address_line1: "", city: "", state: "", country: "India", pincode: "",
    total_builtup_area_sqft: "", leasable_area_sqft: "",
    ownership_type: "OWN", description: "",
  });

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await sitesAPI.list();
      const list = res?.results || res || [];
      setSites(list);
      if (list.length === 0) setShowForm(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      ["total_builtup_area_sqft", "leasable_area_sqft"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      const res = await sitesAPI.create(payload);
      toast.success("Site created");
      onSelected(res.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {!showForm && (
        <>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Select an existing site or create a new one
          </h3>
          <SelectableDataView
            items={sites}
            onSelect={(site) => onSelected(site.id)}
            fields={SITE_FIELDS}
            gridFields={SITE_GRID_FIELDS}
            loading={loading}
            emptyMessage="No sites found"
            icon={Building2}
            onCreateNew={() => setShowForm(true)}
            createLabel="Create New"
          />
        </>
      )}

      {showForm && (
        <div className="py-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">Create New Site</h3>
                <p className="text-xs text-gray-500">Fill in the details to set up your property site</p>
              </div>
            </div>
            {sites.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to list
              </Button>
            )}
          </div>

          <form onSubmit={handleCreate}>
            {/* Basic Info Section */}
            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-700">Basic Info</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Site Name" icon={Building2} value={form.name} onChange={set("name")} required />
                <Input label="Code" icon={Hash} value={form.code} onChange={set("code")} required placeholder="e.g. site-alpha" />
                <Select label="Site Type" value={form.site_type} onChange={set("site_type")} options={SITE_TYPES} required />
                <Select label="Ownership" value={form.ownership_type} onChange={set("ownership_type")} options={OWNERSHIP_TYPES} />
              </div>
            </div>

            {/* Address Section */}
            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-700">Address</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Address" icon={MapPin} value={form.address_line1} onChange={set("address_line1")} />
                <Input label="City" icon={Landmark} value={form.city} onChange={set("city")} />
                <Input label="State" icon={Map} value={form.state} onChange={set("state")} />
                <Input label="Pincode" icon={Navigation} value={form.pincode} onChange={set("pincode")} />
              </div>
            </div>

            {/* Area & Description Section */}
            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
              <div className="flex items-center gap-2 mb-4">
                <Maximize2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-700">Area & Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Total Built-up Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.total_builtup_area_sqft} onChange={set("total_builtup_area_sqft")} />
                <Input label="Leasable Area (sqft)" icon={LayoutGrid} type="number" step="0.01" value={form.leasable_area_sqft} onChange={set("leasable_area_sqft")} />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={set("description")}
                    rows={2}
                    placeholder="Brief description of the site..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5">
              <Button type="submit" loading={saving}>Create & Continue</Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <Button onClick={() => onNext?.()}>Next</Button>
      </div>
    </div>
  );
}
