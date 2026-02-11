import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Layers, Plus, Trash2, Building2, Hash, Maximize2, LayoutGrid,
  Info, ListFilter,
} from "lucide-react";
import { sitesAPI, towersAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import ViewToggle from "../../../components/ui/ViewToggle";
import Modal from "../../../components/ui/Modal";

const BUILDING_TYPES = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "MIXED", label: "Mixed" },
  { value: "OFFICE", label: "Office" },
  { value: "RETAIL", label: "Retail" },
  { value: "WAREHOUSE", label: "Warehouse" },
];

const INITIAL_FORM = {
  name: "", code: "", building_type: "COMMERCIAL",
  total_floors: "", total_area_sqft: "", leasable_area_sqft: "",
};

export default function WizardTowerStep({ siteId: initialSiteId, onNext, onBack }) {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(
    initialSiteId ? String(initialSiteId) : ""
  );
  const [sitesLoading, setSitesLoading] = useState(true);
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalSites, setModalSites] = useState([]);
  const [modalSiteId, setModalSiteId] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (initialSiteId) setSelectedSiteId(String(initialSiteId));
  }, [initialSiteId]);

  useEffect(() => {
    if (selectedSiteId) fetchTowers();
    else setTowers([]);
  }, [selectedSiteId]);

  const fetchSites = async () => {
    setSitesLoading(true);
    try {
      const res = await sitesAPI.list();
      const list = res?.results || res || [];
      setSites(list);
      setSelectedSiteId((prev) => {
        const preferred = initialSiteId ? String(initialSiteId) : "";
        if (preferred && list.some((s) => String(s.id) === preferred)) return preferred;
        if (prev && list.some((s) => String(s.id) === prev)) return prev;
        return list[0] ? String(list[0].id) : "";
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSitesLoading(false);
    }
  };

  const fetchTowers = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const res = await towersAPI.list({ site: selectedSiteId });
      setTowers(res?.results || res || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setForm(INITIAL_FORM);
    try {
      const res = await sitesAPI.list();
      const list = res?.results || res || [];
      setModalSites(list);
      setModalSiteId(selectedSiteId || (list[0] ? String(list[0].id) : ""));
    } catch (err) {
      toast.error(err.message);
    }
    setShowModal(true);
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!modalSiteId) return;
    setSaving(true);
    try {
      const payload = { ...form, site: parseInt(modalSiteId, 10) };
      if (payload.total_floors === "") delete payload.total_floors;
      else payload.total_floors = parseInt(payload.total_floors, 10);
      ["total_area_sqft", "leasable_area_sqft"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      await towersAPI.create(payload);
      toast.success("Tower added");
      setShowModal(false);
      setForm(INITIAL_FORM);
      if (modalSiteId === selectedSiteId) await fetchTowers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this tower?")) return;
    try {
      await towersAPI.delete(id);
      toast.success("Tower deleted");
      await fetchTowers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const towerColumns = [
    { key: "name", label: "Name", render: (row) => row.name || "-" },
    { key: "code", label: "Code", render: (row) => row.code || "-" },
    { key: "building_type", label: "Type", render: (row) => row.building_type || "-" },
    { key: "total_floors", label: "Floors", render: (row) => row.total_floors ?? "-" },
    {
      key: "total_area_sqft",
      label: "Total Area (sqft)",
      render: (row) =>
        row.total_area_sqft == null ? "-" : Number(row.total_area_sqft).toLocaleString(),
    },
    {
      key: "actions",
      label: "Action",
      className: "w-12",
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.id);
          }}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (sitesLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div>
        <Card className="p-8 text-center text-sm text-gray-500">
          No sites found. Create a site in Step 1 first.
        </Card>
        <div className="flex justify-between mt-8">
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button onClick={onNext}>Skip</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ListFilter className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Filter</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Site"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            options={sites.map((s) => ({ value: String(s.id), label: s.name }))}
          />
        </div>
      </div>

      {/* Towers List Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">
              Towers ({towers.length})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {towers.length > 0 && <ViewToggle value={viewMode} onChange={setViewMode} />}
            <Button size="sm" icon={Plus} onClick={openModal}>Add Tower</Button>
          </div>
        </div>

        {towers.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No towers yet. Click "Add Tower" to create one.</p>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {towers.map((t) => (
              <Card key={t.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.code} &middot; {t.building_type || "-"}
                      {t.total_area_sqft ? ` · ${Number(t.total_area_sqft).toLocaleString()} sqft` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-0">
            <DataTable columns={towerColumns} data={towers} emptyMessage="No towers found" />
          </Card>
        )}
      </div>

      {/* Add Tower Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Tower" size="xl">
        <form onSubmit={handleAdd}>
          {/* Hierarchy Section */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-1">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Select Site</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Site"
                value={modalSiteId}
                onChange={(e) => setModalSiteId(e.target.value)}
                options={modalSites.map((s) => ({ value: String(s.id), label: s.name }))}
                required
              />
            </div>
          </div>

          {/* Tower Details Section */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Tower Details</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Tower Name" icon={Layers} value={form.name} onChange={set("name")} required />
              <Input label="Code" icon={Hash} value={form.code} onChange={set("code")} required placeholder="e.g. tower-a" />
              <Select label="Building Type" value={form.building_type} onChange={set("building_type")} options={BUILDING_TYPES} />
              <Input label="Total Floors" icon={LayoutGrid} type="number" value={form.total_floors} onChange={set("total_floors")} />
              <Input label="Total Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.total_area_sqft} onChange={set("total_area_sqft")} />
              <Input label="Leasable Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.leasable_area_sqft} onChange={set("leasable_area_sqft")} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" icon={Plus} loading={saving}>Add Tower</Button>
          </div>
        </form>
      </Modal>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
