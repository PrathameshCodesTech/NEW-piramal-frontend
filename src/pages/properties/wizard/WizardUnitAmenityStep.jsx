import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Check,
  Hash,
  ListFilter,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  amenitiesAPI,
  floorsAPI,
  sitesAPI,
  towersAPI,
  unitAmenitiesAPI,
  unitsAPI,
} from "../../../services/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Select from "../../../components/ui/Select";
import ViewToggle from "../../../components/ui/ViewToggle";

export default function WizardUnitAmenityStep({ siteId: initialSiteId, onNext, onBack }) {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(
    initialSiteId ? String(initialSiteId) : ""
  );
  const [sitesLoading, setSitesLoading] = useState(true);

  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState("");
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");

  const [amenities, setAmenities] = useState([]);
  const [unitAmenities, setUnitAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (initialSiteId) setSelectedSiteId(String(initialSiteId));
  }, [initialSiteId]);

  useEffect(() => {
    if (selectedSiteId) fetchInitial();
    else {
      setTowers([]);
      setFloors([]);
      setUnits([]);
      setAmenities([]);
      setUnitAmenities([]);
      setSelectedTower("");
      setSelectedFloor("");
      setSelectedUnit("");
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (selectedTower) fetchFloors();
    else {
      setFloors([]);
      setSelectedFloor("");
      setUnits([]);
      setSelectedUnit("");
      setUnitAmenities([]);
    }
  }, [selectedTower]);

  useEffect(() => {
    if (selectedFloor) fetchUnits();
    else {
      setUnits([]);
      setSelectedUnit("");
      setUnitAmenities([]);
    }
  }, [selectedFloor]);

  useEffect(() => {
    if (selectedUnit) fetchUnitAmenities();
    else setUnitAmenities([]);
  }, [selectedUnit]);

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

  const fetchInitial = async () => {
    if (!selectedSiteId) return;
    setLoading(true);
    try {
      const [towerRes, amenityRes] = await Promise.all([
        towersAPI.list({ site: selectedSiteId }),
        amenitiesAPI.list(),
      ]);
      const towerList = towerRes?.results || towerRes || [];
      const amenityList = amenityRes?.results || amenityRes || [];
      setTowers(towerList);
      setAmenities(amenityList);
      if (towerList.length > 0) {
        setSelectedTower(String(towerList[0].id));
      } else {
        setSelectedTower("");
        setFloors([]);
        setSelectedFloor("");
        setUnits([]);
        setSelectedUnit("");
        setUnitAmenities([]);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async () => {
    try {
      const res = await floorsAPI.list({ tower: selectedTower });
      const list = res?.results || res || [];
      setFloors(list);
      if (list.length > 0) {
        setSelectedFloor(String(list[0].id));
      } else {
        setSelectedFloor("");
        setUnits([]);
        setSelectedUnit("");
        setUnitAmenities([]);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await unitsAPI.list({ floor: selectedFloor });
      const list = res?.results || res || [];
      setUnits(list);
      if (list.length > 0) {
        setSelectedUnit(String(list[0].id));
      } else {
        setSelectedUnit("");
        setUnitAmenities([]);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchUnitAmenities = async () => {
    setAmenitiesLoading(true);
    try {
      const res = await unitAmenitiesAPI.list({ unit: selectedUnit });
      setUnitAmenities(res?.results || res || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAmenitiesLoading(false);
    }
  };

  const unitAmenityMap = useMemo(() => {
    const map = {};
    (unitAmenities || []).forEach((ua) => {
      map[ua.amenity] = ua.id;
    });
    return map;
  }, [unitAmenities]);

  const selectedCount = Object.keys(unitAmenityMap).length;

  const handleToggle = async (amenityId) => {
    if (!selectedUnit) return;
    setToggling(amenityId);
    try {
      if (unitAmenityMap[amenityId]) {
        await unitAmenitiesAPI.delete(unitAmenityMap[amenityId]);
        toast.success("Amenity removed from unit");
      } else {
        await unitAmenitiesAPI.create({
          unit: parseInt(selectedUnit, 10),
          amenity: amenityId,
        });
        toast.success("Amenity added to unit");
      }
      const uaRes = await unitAmenitiesAPI.list({ unit: selectedUnit });
      setUnitAmenities(uaRes?.results || uaRes || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(null);
    }
  };

  const openModal = () => {
    setNewName("");
    setNewCode("");
    setShowModal(true);
  };

  const handleAddAmenity = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await amenitiesAPI.create({ name: newName, code: newCode });
      toast.success("Amenity created");
      setShowModal(false);
      const res = await amenitiesAPI.list();
      setAmenities(res?.results || res || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const amenityColumns = [
    { key: "name", label: "Name", render: (row) => row.name || "-" },
    { key: "code", label: "Code", render: (row) => row.code || "-" },
    {
      key: "selected",
      label: "Selected",
      render: (row) => (unitAmenityMap[row.id] ? "Yes" : "No"),
    },
    {
      key: "action",
      label: "Action",
      className: "w-28",
      render: (row) => {
        const linked = !!unitAmenityMap[row.id];
        const busy = toggling === row.id;
        return (
          <button
            type="button"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(row.id);
            }}
            className={`text-xs font-medium px-2 py-1 rounded-md border transition-colors cursor-pointer disabled:opacity-60 ${
              linked
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {linked ? "Remove" : "Add"}
          </button>
        );
      },
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
            options={floors.map((f) => ({ value: String(f.id), label: `Floor ${f.number}` }))}
          />
          <Select
            label="Unit"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            options={units.map((u) => ({ value: String(u.id), label: u.unit_no }))}
          />
        </div>
      </div>

      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">
              Unit Amenities ({selectedCount} selected)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {amenities.length > 0 && <ViewToggle value={viewMode} onChange={setViewMode} />}
            <Button size="sm" icon={Plus} onClick={openModal}>New Amenity</Button>
          </div>
        </div>

        {!selectedUnit ? (
          <p className="text-sm text-gray-500 py-4">
            {floors.length === 0
              ? "No floors found for this tower. Add floors and units first."
              : "Select a unit to manage its amenities."}
          </p>
        ) : amenitiesLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : amenities.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            No amenities defined yet. Add amenities in the Amenities step first.
          </p>
        ) : viewMode === "grid" ? (
          <div className="flex flex-wrap gap-2">
            {amenities.map((am) => {
              const linked = !!unitAmenityMap[am.id];
              const busy = toggling === am.id;
              return (
                <button
                  key={am.id}
                  disabled={busy}
                  onClick={() => handleToggle(am.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer disabled:opacity-60 ${
                    linked
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {linked && <Check className="w-3.5 h-3.5" />}
                  {am.name}
                </button>
              );
            })}
          </div>
        ) : (
          <Card className="p-0">
            <DataTable columns={amenityColumns} data={amenities} emptyMessage="No amenities found" />
          </Card>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Amenity" size="sm">
        <form onSubmit={handleAddAmenity}>
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Amenity Details</h4>
            </div>
            <div className="space-y-4">
              <Input
                label="Name"
                icon={Sparkles}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <Input
                label="Code"
                icon={Hash}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
                placeholder="e.g. work-desk"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" icon={Plus} loading={adding}>Add Amenity</Button>
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
