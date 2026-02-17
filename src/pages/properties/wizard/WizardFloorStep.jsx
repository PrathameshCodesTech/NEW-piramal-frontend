import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus, Trash2, Building2, LayoutList, Hash,
  Maximize2, Info, ListFilter,
} from "lucide-react";
import { sitesAPI, towersAPI, floorsAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import ViewToggle from "../../../components/ui/ViewToggle";
import Modal from "../../../components/ui/Modal";

const FLOOR_STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "LEASED", label: "Leased" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const INITIAL_FORM = {
  number: "", label: "", status: "AVAILABLE",
  total_area_sqft: "", leasable_area_sqft: "",
};

export default function WizardFloorStep({ siteId: initialSiteId, onNext, onBack }) {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(
    initialSiteId ? String(initialSiteId) : ""
  );
  const [sitesLoading, setSitesLoading] = useState(true);
  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState("");
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [floorsLoading, setFloorsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalSites, setModalSites] = useState([]);
  const [modalSiteId, setModalSiteId] = useState("");
  const [modalTowers, setModalTowers] = useState([]);
  const [modalTowerId, setModalTowerId] = useState("");
  const [modalTowerFloors, setModalTowerFloors] = useState([]);
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
      setSelectedTower("");
      setFloors([]);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (selectedTower) fetchFloors();
    else setFloors([]);
  }, [selectedTower]);

  // Modal cascade: when modal site changes, fetch towers for modal
  useEffect(() => {
    if (showModal && modalSiteId) fetchModalTowers();
    else if (showModal) { setModalTowers([]); setModalTowerId(""); setModalTowerFloors([]); }
  }, [modalSiteId, showModal]);

  useEffect(() => {
    if (showModal && modalTowerId) fetchModalTowerFloors();
    else if (showModal) setModalTowerFloors([]);
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
      if (list.length > 0) {
        setSelectedTower(String(list[0].id));
      } else {
        setSelectedTower("");
        setFloors([]);
      }
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
      setFloors(res?.results || res || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFloorsLoading(false);
    }
  };

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

  const fetchModalTowerFloors = async () => {
    try {
      const res = await floorsAPI.list({ tower: modalTowerId });
      setModalTowerFloors(res?.results || res || []);
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
    if (!modalTowerId) return;
    const floorNumber = parseInt(form.number, 10);
    if (Number.isNaN(floorNumber)) {
      toast.error("Please enter a valid floor number.");
      return;
    }

    setSaving(true);
    try {
      const existingRes = await floorsAPI.list({ tower: modalTowerId });
      const existingFloors = existingRes?.results || existingRes || [];
      const existingNumbers = new Set(
        existingFloors
          .map((f) => parseInt(f.number, 10))
          .filter((n) => !Number.isNaN(n))
      );
      if (existingNumbers.has(floorNumber)) {
        toast.error(`Floor number ${floorNumber} already exists for this tower.`);
        return;
      }

      const selectedModalTower = modalTowers.find((t) => String(t.id) === String(modalTowerId));
      const plannedCount = parseInt(selectedModalTower?.total_floors, 10);
      if (!Number.isNaN(plannedCount) && plannedCount > 0 && floorNumber > plannedCount) {
        toast("This floor number is above the planned tower floor count. Saving anyway.");
      }

      const payload = {
        ...form,
        site: parseInt(modalSiteId, 10),
        tower: parseInt(modalTowerId, 10),
        number: floorNumber,
      };
      ["total_area_sqft", "leasable_area_sqft"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      await floorsAPI.create(payload);
      toast.success("Floor added");
      setShowModal(false);
      setForm(INITIAL_FORM);
      if (modalTowerId === selectedTower) await fetchFloors();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this floor?")) return;
    try {
      await floorsAPI.delete(id);
      toast.success("Floor deleted");
      await fetchFloors();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const floorColumns = [
    { key: "number", label: "Floor", render: (row) => row.number ?? "-" },
    { key: "label", label: "Label", render: (row) => row.label || "-" },
    { key: "status", label: "Status", render: (row) => row.status || "-" },
    {
      key: "total_area_sqft",
      label: "Total Area (sqft)",
      render: (row) =>
        row.total_area_sqft == null ? "-" : Number(row.total_area_sqft).toLocaleString(),
    },
    {
      key: "leasable_area_sqft",
      label: "Leasable Area (sqft)",
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

  const selectedTowerObj = towers.find((t) => String(t.id) === String(selectedTower));
  const plannedFloors = parseInt(selectedTowerObj?.total_floors, 10);
  const usedNumbers = [...new Set(
    floors.map((f) => parseInt(f.number, 10)).filter((n) => !Number.isNaN(n))
  )].sort((a, b) => a - b);
  const remainingFloors = !Number.isNaN(plannedFloors) && plannedFloors > 0
    ? plannedFloors - usedNumbers.length
    : null;

  const selectedModalTowerObj = modalTowers.find((t) => String(t.id) === String(modalTowerId));
  const modalPlannedFloors = parseInt(selectedModalTowerObj?.total_floors, 10);
  const modalUsedNumbers = [...new Set(
    modalTowerFloors.map((f) => parseInt(f.number, 10)).filter((n) => !Number.isNaN(n))
  )].sort((a, b) => a - b);
  const formFloorNumber = parseInt(form.number, 10);
  const formDuplicateFloor = !Number.isNaN(formFloorNumber) && modalUsedNumbers.includes(formFloorNumber);
  const formExceedsPlanned = (
    !Number.isNaN(formFloorNumber) &&
    !Number.isNaN(modalPlannedFloors) &&
    modalPlannedFloors > 0 &&
    formFloorNumber > modalPlannedFloors
  );

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
        </div>
      </div>

      {/* Floors List Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutList className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">
              Floors ({floors.length})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {floors.length > 0 && <ViewToggle value={viewMode} onChange={setViewMode} />}
            <Button size="sm" icon={Plus} onClick={openModal}>Add Floor</Button>
          </div>
        </div>

        {selectedTowerObj && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <p>
              Tower plan: {Number.isNaN(plannedFloors) || plannedFloors <= 0 ? "Not set" : `${plannedFloors} floors`} |
              {" "}Created: {usedNumbers.length}
              {remainingFloors !== null ? ` | Remaining: ${Math.max(remainingFloors, 0)}` : ""}
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Numbering used: {usedNumbers.length ? usedNumbers.join(", ") : "none yet"}
            </p>
          </div>
        )}

        {floorsLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : floors.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No floors yet. Click "Add Floor" to create one.</p>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {floors.map((f) => (
              <Card key={f.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <LayoutList className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Floor {f.number}{f.label ? ` - ${f.label}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {f.status} &middot; {Number(f.total_area_sqft || 0).toLocaleString()} sqft
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-0">
            <DataTable columns={floorColumns} data={floors} emptyMessage="No floors found" />
          </Card>
        )}
      </div>

      {/* Add Floor Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Floor" size="xl">
        <form onSubmit={handleAdd}>
          {/* Hierarchy Section */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-1">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Select Location</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>
          </div>

          {/* Floor Details Section */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Floor Details</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Input label="Floor Number" icon={Hash} type="number" value={form.number} onChange={set("number")} required />
                <p className="text-xs text-gray-500 mt-1">
                  {Number.isNaN(modalPlannedFloors) || modalPlannedFloors <= 0
                    ? "Tip: Set planned floor count in tower details for guidance."
                    : `This tower is planned for ${modalPlannedFloors} floors. Used: ${modalUsedNumbers.length}.`}
                </p>
                {formDuplicateFloor && (
                  <p className="text-xs text-red-600 mt-1">
                    Floor {formFloorNumber} already exists in this tower.
                  </p>
                )}
                {!formDuplicateFloor && formExceedsPlanned && (
                  <p className="text-xs text-amber-700 mt-1">
                    This number is above planned count ({modalPlannedFloors}). You can still save.
                  </p>
                )}
              </div>
              <Input label="Label" icon={LayoutList} value={form.label} onChange={set("label")} placeholder="e.g. Ground Floor" />
              <Select label="Status" value={form.status} onChange={set("status")} options={FLOOR_STATUSES} />
              <Input label="Total Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.total_area_sqft} onChange={set("total_area_sqft")} />
              <Input label="Leasable Area (sqft)" icon={Maximize2} type="number" step="0.01" value={form.leasable_area_sqft} onChange={set("leasable_area_sqft")} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" icon={Plus} loading={saving}>Add Floor</Button>
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
