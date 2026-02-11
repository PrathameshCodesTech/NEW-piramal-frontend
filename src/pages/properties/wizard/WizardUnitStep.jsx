import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus, Trash2, Building2, DoorOpen, Hash,
  Maximize2, Info, ListFilter, IndianRupee,
} from "lucide-react";
import { sitesAPI, towersAPI, floorsAPI, unitsAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import ViewToggle from "../../../components/ui/ViewToggle";
import Modal from "../../../components/ui/Modal";

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

const INITIAL_FORM = {
  unit_no: "", unit_type: "COMMERCIAL", status: "AVAILABLE",
  builtup_area_sqft: "", leasable_area_sqft: "",
  base_rent_default: "", cam_default: "",
};

export default function WizardUnitStep({ siteId: initialSiteId, onNext, onBack }) {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(
    initialSiteId ? String(initialSiteId) : ""
  );
  const [sitesLoading, setSitesLoading] = useState(true);
  const [towers, setTowers] = useState([]);
  const [floors, setFloors] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedTower, setSelectedTower] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [loading, setLoading] = useState(false);
  const [floorsLoading, setFloorsLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalSites, setModalSites] = useState([]);
  const [modalSiteId, setModalSiteId] = useState("");
  const [modalTowers, setModalTowers] = useState([]);
  const [modalTowerId, setModalTowerId] = useState("");
  const [modalFloors, setModalFloors] = useState([]);
  const [modalFloorId, setModalFloorId] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (initialSiteId) setSelectedSiteId(String(initialSiteId));
  }, [initialSiteId]);

  useEffect(() => {
    if (selectedSiteId) fetchTowers();
    else {
      setTowers([]);
      setFloors([]);
      setUnits([]);
      setSelectedTower("");
      setSelectedFloor("");
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (selectedTower) fetchFloors();
    else { setFloors([]); setSelectedFloor(""); setUnits([]); }
  }, [selectedTower]);

  useEffect(() => {
    if (selectedFloor) fetchUnits();
    else setUnits([]);
  }, [selectedFloor]);

  // Modal cascade
  useEffect(() => {
    if (showModal && modalSiteId) fetchModalTowers();
    else if (showModal) { setModalTowers([]); setModalTowerId(""); setModalFloors([]); setModalFloorId(""); }
  }, [modalSiteId, showModal]);

  useEffect(() => {
    if (showModal && modalTowerId) fetchModalFloors();
    else if (showModal) { setModalFloors([]); setModalFloorId(""); }
  }, [modalTowerId, showModal]);

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
      const list = res?.results || res || [];
      setTowers(list);
      if (list.length > 0) setSelectedTower(String(list[0].id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async () => {
    setFloorsLoading(true);
    try {
      const res = await floorsAPI.list({ tower: selectedTower });
      const list = res?.results || res || [];
      setFloors(list);
      if (list.length > 0) setSelectedFloor(String(list[0].id));
      else setSelectedFloor("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFloorsLoading(false);
    }
  };

  const fetchUnits = async () => {
    setUnitsLoading(true);
    try {
      const res = await unitsAPI.list({ floor: selectedFloor });
      setUnits(res?.results || res || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUnitsLoading(false);
    }
  };

  // Modal fetchers
  const fetchModalTowers = async () => {
    try {
      const res = await towersAPI.list({ site: modalSiteId });
      const list = res?.results || res || [];
      setModalTowers(list);
      setModalTowerId(list[0] ? String(list[0].id) : "");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchModalFloors = async () => {
    try {
      const res = await floorsAPI.list({ tower: modalTowerId });
      const list = res?.results || res || [];
      setModalFloors(list);
      setModalFloorId(list[0] ? String(list[0].id) : "");
    } catch (err) {
      toast.error(err.message);
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
    if (!modalFloorId) return;
    setSaving(true);
    try {
      const payload = { ...form, floor: parseInt(modalFloorId, 10) };
      ["builtup_area_sqft", "leasable_area_sqft", "base_rent_default", "cam_default"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      await unitsAPI.create(payload);
      toast.success("Unit added");
      setShowModal(false);
      setForm(INITIAL_FORM);
      if (modalFloorId === selectedFloor) await fetchUnits();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this unit?")) return;
    try {
      await unitsAPI.delete(id);
      toast.success("Unit deleted");
      await fetchUnits();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unitColumns = [
    { key: "unit_no", label: "Unit", render: (row) => row.unit_no || "-" },
    { key: "unit_type", label: "Type", render: (row) => row.unit_type || "-" },
    { key: "status", label: "Status", render: (row) => row.status || "-" },
    {
      key: "builtup_area_sqft",
      label: "Built-up (sqft)",
      render: (row) =>
        row.builtup_area_sqft == null ? "-" : Number(row.builtup_area_sqft).toLocaleString(),
    },
    {
      key: "leasable_area_sqft",
      label: "Leasable (sqft)",
      render: (row) =>
        row.leasable_area_sqft == null ? "-" : Number(row.leasable_area_sqft).toLocaleString(),
    },
    {
      key: "action",
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

  if (towers.length === 0) {
    return (
      <div>
        <Card className="p-8 text-center text-sm text-gray-500">
          No towers found. Go back and add towers first.
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
          <Select
            label="Tower"
            value={selectedTower}
            onChange={(e) => setSelectedTower(e.target.value)}
            options={towers.map((t) => ({ value: String(t.id), label: t.name }))}
          />
          <Select
            label="Floor"
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            options={floors.map((f) => ({
              value: String(f.id),
              label: `Floor ${f.number}${f.label ? ` — ${f.label}` : ""}`,
            }))}
          />
        </div>
      </div>

      {/* Units List Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">
              Units ({units.length})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {units.length > 0 && <ViewToggle value={viewMode} onChange={setViewMode} />}
            <Button size="sm" icon={Plus} onClick={openModal} disabled={!selectedFloor}>Add Unit</Button>
          </div>
        </div>

        {floorsLoading || unitsLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !selectedFloor ? (
          <p className="text-sm text-gray-500 py-4">
            {floors.length === 0
              ? "No floors for this tower. Go back and add floors first."
              : "Select a floor to manage units."}
          </p>
        ) : units.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No units yet. Click "Add Unit" to create one.</p>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {units.map((u) => (
              <Card key={u.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <DoorOpen className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.unit_no}</p>
                    <p className="text-xs text-gray-500">
                      {u.unit_type} &middot; {Number(u.builtup_area_sqft || 0).toLocaleString()} sqft
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    color={
                      u.status === "AVAILABLE" ? "emerald"
                        : u.status === "LEASED" ? "blue"
                        : "amber"
                    }
                  >
                    {u.status}
                  </Badge>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-0">
            <DataTable columns={unitColumns} data={units} emptyMessage="No units found" />
          </Card>
        )}
      </div>

      {/* Add Unit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Unit" size="xl">
        <form onSubmit={handleAdd}>
          {/* Hierarchy Section */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-1">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Select Location</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                label="Site"
                value={modalSiteId}
                onChange={(e) => setModalSiteId(e.target.value)}
                options={modalSites.map((s) => ({ value: String(s.id), label: s.name }))}
                required
              />
              <Select
                label="Tower"
                value={modalTowerId}
                onChange={(e) => setModalTowerId(e.target.value)}
                options={modalTowers.map((t) => ({ value: String(t.id), label: t.name }))}
                required
              />
              <Select
                label="Floor"
                value={modalFloorId}
                onChange={(e) => setModalFloorId(e.target.value)}
                options={modalFloors.map((f) => ({
                  value: String(f.id),
                  label: `Floor ${f.number}${f.label ? ` — ${f.label}` : ""}`,
                }))}
                required
              />
            </div>
          </div>

          {/* Unit Details Section */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Unit Details</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Unit No" icon={Hash} value={form.unit_no} onChange={set("unit_no")} required placeholder="e.g. 101" />
              <Select label="Type" value={form.unit_type} onChange={set("unit_type")} options={UNIT_TYPES} required />
              <Select label="Status" value={form.status} onChange={set("status")} options={UNIT_STATUSES} />
              <Input label="Built-up Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.builtup_area_sqft} onChange={set("builtup_area_sqft")} />
              <Input label="Leasable Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.leasable_area_sqft} onChange={set("leasable_area_sqft")} />
              <Input label="Base Rent Default" icon={IndianRupee} type="number" step="0.01" value={form.base_rent_default} onChange={set("base_rent_default")} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" icon={Plus} loading={saving}>Add Unit</Button>
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
