import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus, Trash2, Package, Building2, Hash,
  Info, ListFilter,
} from "lucide-react";
import {
  sitesAPI,
  towersAPI, floorsAPI, unitsAPI,
  assetCategoriesAPI, assetItemsAPI, unitAssetsAPI,
} from "../../../services/api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import ViewToggle from "../../../components/ui/ViewToggle";
import Modal from "../../../components/ui/Modal";

export default function WizardAssetStep({ siteId: initialSiteId, onFinish, onBack }) {
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
  const [selectedUnit, setSelectedUnit] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  // Assets
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalSites, setModalSites] = useState([]);
  const [modalSiteId, setModalSiteId] = useState("");
  const [modalTowers, setModalTowers] = useState([]);
  const [modalTowerId, setModalTowerId] = useState("");
  const [modalFloors, setModalFloors] = useState([]);
  const [modalFloorId, setModalFloorId] = useState("");
  const [modalUnits, setModalUnits] = useState([]);
  const [modalUnitId, setModalUnitId] = useState("");

  // Add form
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [form, setForm] = useState({ asset_item: "", quantity: "1", condition: "", notes: "" });
  const [saving, setSaving] = useState(false);

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
      setAssets([]);
      setSelectedTower("");
      setSelectedFloor("");
      setSelectedUnit("");
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (selectedTower) fetchFloors();
    else { setFloors([]); setSelectedFloor(""); setUnits([]); setSelectedUnit(""); }
  }, [selectedTower]);

  useEffect(() => {
    if (selectedFloor) fetchUnits();
    else { setUnits([]); setSelectedUnit(""); }
  }, [selectedFloor]);

  useEffect(() => {
    if (selectedUnit) fetchAssets();
    else setAssets([]);
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedCategory) fetchItems();
    else setItems([]);
  }, [selectedCategory]);

  // Modal cascade
  useEffect(() => {
    if (showModal && modalSiteId) fetchModalTowers();
    else if (showModal) { setModalTowers([]); setModalTowerId(""); setModalFloors([]); setModalFloorId(""); setModalUnits([]); setModalUnitId(""); }
  }, [modalSiteId, showModal]);

  useEffect(() => {
    if (showModal && modalTowerId) fetchModalFloors();
    else if (showModal) { setModalFloors([]); setModalFloorId(""); setModalUnits([]); setModalUnitId(""); }
  }, [modalTowerId, showModal]);

  useEffect(() => {
    if (showModal && modalFloorId) fetchModalUnits();
    else if (showModal) { setModalUnits([]); setModalUnitId(""); }
  }, [modalFloorId, showModal]);

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
      const [towRes, catRes] = await Promise.all([
        towersAPI.list({ site: selectedSiteId }),
        assetCategoriesAPI.list(),
      ]);
      const tList = towRes?.results || towRes || [];
      setTowers(tList);
      if (tList.length > 0) setSelectedTower(String(tList[0].id));
      setCategories(catRes?.results || catRes || []);
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
      if (list.length > 0) setSelectedFloor(String(list[0].id));
      else setSelectedFloor("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await unitsAPI.list({ floor: selectedFloor });
      const list = res?.results || res || [];
      setUnits(list);
      if (list.length > 0) setSelectedUnit(String(list[0].id));
      else setSelectedUnit("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchAssets = async () => {
    setAssetsLoading(true);
    try {
      const res = await unitAssetsAPI.list({ unit: selectedUnit });
      setAssets(res?.results || res || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAssetsLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await assetItemsAPI.list({ category: selectedCategory });
      setItems(res?.results || res || []);
    } catch (err) {
      toast.error(err.message);
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

  const fetchModalUnits = async () => {
    try {
      const res = await unitsAPI.list({ floor: modalFloorId });
      const list = res?.results || res || [];
      setModalUnits(list);
      setModalUnitId(list[0] ? String(list[0].id) : "");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openModal = async () => {
    setForm({ asset_item: "", quantity: "1", condition: "", notes: "" });
    setSelectedCategory("");
    setItems([]);
    try {
      const [sRes, catRes] = await Promise.all([
        sitesAPI.list(),
        assetCategoriesAPI.list(),
      ]);
      const sList = sRes?.results || sRes || [];
      setModalSites(sList);
      setModalSiteId(selectedSiteId || (sList[0] ? String(sList[0].id) : ""));
      setCategories(catRes?.results || catRes || []);
    } catch (err) {
      toast.error(err.message);
    }
    setShowModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!modalUnitId || !form.asset_item) return;
    setSaving(true);
    try {
      await unitAssetsAPI.create({
        unit: parseInt(modalUnitId, 10),
        asset_item: parseInt(form.asset_item, 10),
        quantity: parseInt(form.quantity, 10) || 1,
        condition: form.condition,
        notes: form.notes,
      });
      toast.success("Asset added");
      setShowModal(false);
      setForm({ asset_item: "", quantity: "1", condition: "", notes: "" });
      if (modalUnitId === selectedUnit) await fetchAssets();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this asset?")) return;
    try {
      await unitAssetsAPI.delete(id);
      toast.success("Asset removed");
      await fetchAssets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const assetColumns = [
    {
      key: "asset_item_name",
      label: "Asset",
      render: (row) => row.asset_item_name || `Item #${row.asset_item}`,
    },
    { key: "quantity", label: "Qty", render: (row) => row.quantity ?? 0 },
    { key: "condition", label: "Condition", render: (row) => row.condition || "-" },
    { key: "notes", label: "Notes", render: (row) => row.notes || "-" },
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
          <Button onClick={onFinish}>Finish Setup</Button>
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

      {/* Assets List Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">
              Unit Assets ({assets.length})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {assets.length > 0 && <ViewToggle value={viewMode} onChange={setViewMode} />}
            <Button size="sm" icon={Plus} onClick={openModal} disabled={!selectedUnit}>Add Asset</Button>
          </div>
        </div>

        {!selectedUnit ? (
          <p className="text-sm text-gray-500 py-4">
            {towers.length === 0
              ? "No towers found. Go back and set up the property hierarchy first."
              : "Select a unit to manage assets."}
          </p>
        ) : assetsLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No assets yet. Click "Add Asset" to assign one.</p>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {assets.map((a) => (
              <Card key={a.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {a.asset_item_name || `Item #${a.asset_item}`} x{a.quantity}
                    </p>
                    {a.condition && (
                      <p className="text-xs text-gray-500">{a.condition}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-0">
            <DataTable columns={assetColumns} data={assets} emptyMessage="No assets found" />
          </Card>
        )}
      </div>

      {/* Add Asset Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Asset" size="xl">
        <form onSubmit={handleAdd}>
          {/* Hierarchy Section */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-1">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Select Unit</h4>
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
              <Select
                label="Floor"
                value={modalFloorId}
                onChange={(e) => setModalFloorId(e.target.value)}
                options={modalFloors.map((f) => ({ value: String(f.id), label: `Floor ${f.number}` }))}
                required
              />
              <Select
                label="Unit"
                value={modalUnitId}
                onChange={(e) => setModalUnitId(e.target.value)}
                options={modalUnits.map((u) => ({ value: String(u.id), label: u.unit_no }))}
                required
              />
            </div>
          </div>

          {/* Asset Details Section */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Asset Details</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setForm({ ...form, asset_item: "" });
                }}
                options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
              />
              <Select
                label="Item"
                value={form.asset_item}
                onChange={(e) => setForm({ ...form, asset_item: e.target.value })}
                options={items.map((i) => ({ value: String(i.id), label: i.name }))}
                required
              />
              <Input
                label="Quantity"
                icon={Hash}
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
              <Input
                label="Condition"
                icon={Package}
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                placeholder="e.g. New, Good"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" icon={Plus} loading={saving} disabled={!form.asset_item}>Add Asset</Button>
          </div>
        </form>
      </Modal>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={onFinish}>Finish Setup</Button>
      </div>
    </div>
  );
}
