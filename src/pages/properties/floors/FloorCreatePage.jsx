import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Layers, Hash, Tag, LayoutGrid, Maximize2, FileText } from "lucide-react";
import { floorsAPI, towersAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const FLOOR_STATUS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "LEASED", label: "Leased" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export default function FloorCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSite = searchParams.get("site");
  const preselectedTower = searchParams.get("tower");
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolvedSite, setResolvedSite] = useState(null);
  const [form, setForm] = useState({
    tower: preselectedTower || "",
    number: "", label: "", status: "AVAILABLE",
    total_area_sqft: "", leasable_area_sqft: "", cam_area_sqft: "",
    floor_type: "", allowed_use: "", leasing_type: "", max_units_allowed: "",
  });

  useEffect(() => {
    if (preselectedSite) {
      setResolvedSite(preselectedSite);
      towersAPI.list({ site: preselectedSite }).then((r) => setTowers(r?.results || r || [])).catch(() => setTowers([]));
    } else if (preselectedTower) {
      towersAPI.get(preselectedTower).then((t) => {
        setResolvedSite(t.site);
        towersAPI.list({ site: t.site }).then((r) => setTowers(r?.results || r || [])).catch(() => setTowers([]));
      }).catch(() => { setTowers([]); setResolvedSite(null); });
    } else {
      setTowers([]);
      setResolvedSite(null);
    }
  }, [preselectedSite, preselectedTower]);

  const siteId = preselectedSite || resolvedSite || null;
  const towerId = form.tower || preselectedTower || (towers.length === 1 ? towers[0]?.id : null);
  const towerOptions = towers.map((t) => ({ value: t.id, label: t.name ? `${t.name} (${t.code || t.id})` : `Tower #${t.id}` }));

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tid = form.tower || preselectedTower || (towers.length === 1 ? towers[0]?.id : null);
    const sid = siteId;
    if (!tid || !sid) { toast.error("Please select a tower"); return; }
    setLoading(true);
    try {
      const payload = { ...form, tower: tid, site: sid };
      ["total_area_sqft", "leasable_area_sqft", "cam_area_sqft", "max_units_allowed"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      if (payload.number === "") { toast.error("Floor number is required"); setLoading(false); return; }
      payload.number = parseInt(payload.number, 10);
      await floorsAPI.create(payload);
      toast.success("Floor created");
      navigate(`/properties/sites/${sid}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Floor" backTo={siteId ? `/properties/sites/${siteId}` : "/properties"} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {towerOptions.length > 0 && (
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg bg-gray-50">
            <Select
              label="Tower"
              value={form.tower || preselectedTower || ""}
              onChange={set("tower")}
              options={towerOptions}
              placeholder="Select tower"
              required
            />
          </div>
        )}
        {/* Floor Info */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Floor Info</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Floor Number" icon={Hash} type="number" value={form.number} onChange={set("number")} required />
            <Input label="Label" icon={Tag} value={form.label} onChange={set("label")} placeholder="e.g. Ground Floor" />
            <Select label="Status" value={form.status} onChange={set("status")} options={FLOOR_STATUS} />
            <Input label="Floor Type" icon={LayoutGrid} value={form.floor_type} onChange={set("floor_type")} placeholder="e.g. Office, Retail" />
          </div>
        </div>

        {/* Area & Usage */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Maximize2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Area & Usage</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Total Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.total_area_sqft} onChange={set("total_area_sqft")} required />
            <Input label="Leasable Area (sqft)" icon={LayoutGrid} type="number" step="0.01" value={form.leasable_area_sqft} onChange={set("leasable_area_sqft")} required />
            <Input label="CAM Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.cam_area_sqft} onChange={set("cam_area_sqft")} />
            <Input label="Max Units Allowed" icon={Hash} type="number" value={form.max_units_allowed} onChange={set("max_units_allowed")} />
            <Input label="Allowed Use" icon={FileText} value={form.allowed_use} onChange={set("allowed_use")} />
            <Input label="Leasing Type" icon={FileText} value={form.leasing_type} onChange={set("leasing_type")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate(siteId ? `/properties/sites/${siteId}` : "/properties")}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Floor</Button>
        </div>
      </form>
    </div>
  );
}
