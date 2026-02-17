import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2,
  ChevronRight,
  DoorOpen,
  Layers,
  LayoutGrid,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Maximize2,
  IndianRupee,
  FileText,
  Sparkles,
  Package,
} from "lucide-react";
import { floorsAPI, sitesAPI, towersAPI, unitsAPI, siteAmenitiesAPI, unitAmenitiesAPI } from "../../../services/api";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import PageHeader from "../../../components/ui/PageHeader";
import Stepper from "../../../components/ui/Stepper";

export default function SiteViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const [selectedTowerId, setSelectedTowerId] = useState(null);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const [siteAmenities, setSiteAmenities] = useState([]);
  const [unitAmenities, setUnitAmenities] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadTree = () => {
    setLoading(true);
    sitesAPI
      .fullTree(id)
      .then((res) => setTree(res))
      .catch(() => setTree(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTree();
    siteAmenitiesAPI.list({ site: id }).then((res) => setSiteAmenities(res?.results || res || [])).catch(() => {});
  }, [id]);

  // Load unit amenities when a unit is selected
  useEffect(() => {
    if (selectedUnitId) {
      unitAmenitiesAPI.list({ unit: selectedUnitId }).then((res) => setUnitAmenities(res?.results || res || [])).catch(() => {});
    } else {
      setUnitAmenities([]);
    }
  }, [selectedUnitId]);

  const towers = tree?.towers || [];
  const selectedTower = towers.find((t) => t.id === selectedTowerId) || null;
  const floors = selectedTower?.floors || [];
  const selectedFloor = floors.find((f) => f.id === selectedFloorId) || null;
  const units = selectedFloor?.units || [];
  const selectedUnit = units.find((u) => u.id === selectedUnitId) || null;

  const allFloors = useMemo(() => towers.flatMap((t) => t.floors || []), [towers]);
  const allUnits = useMemo(() => allFloors.flatMap((f) => f.units || []), [allFloors]);

  const steps = [
    { label: "Site", subtitle: "Overview", icon: Building2 },
    { label: "Towers", subtitle: `${towers.length} tower(s)`, icon: Layers },
    { label: "Floors", subtitle: `${selectedTower ? floors.length : allFloors.length} floor(s)`, icon: LayoutGrid },
    { label: "Units", subtitle: `${selectedFloor ? units.length : allUnits.length} unit(s)`, icon: DoorOpen },
  ];

  const fmt = (v) => Number(v || 0).toLocaleString();

  const handleStepClick = (step) => {
    if (step <= activeStep) {
      if (step < 3) setSelectedUnitId(null);
      if (step < 2) setSelectedFloorId(null);
      if (step < 1) setSelectedTowerId(null);
      setActiveStep(step);
      return;
    }
    let towerId = selectedTowerId;
    let floorId = selectedFloorId;
    if (step >= 1 && !towerId && towers.length > 0) { towerId = towers[0].id; setSelectedTowerId(towerId); }
    if (step >= 2 && !floorId) {
      const fl = (towers.find((t) => t.id === towerId)?.floors || []);
      if (fl.length > 0) { floorId = fl[0].id; setSelectedFloorId(floorId); }
    }
    if (step >= 3 && !selectedUnitId) {
      const ul = ((towers.find((t) => t.id === towerId)?.floors || []).find((f) => f.id === floorId)?.units || []);
      if (ul.length > 0) setSelectedUnitId(ul[0].id);
    }
    setActiveStep(step);
  };

  const selectTower = (towerId) => { setSelectedTowerId(towerId); setSelectedFloorId(null); setSelectedUnitId(null); setActiveStep(1); };
  const selectFloor = (floorId) => { setSelectedFloorId(floorId); setSelectedUnitId(null); setActiveStep(2); };
  const selectUnit = (unitId) => { setSelectedUnitId(unitId); setActiveStep(3); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "tower") await towersAPI.delete(deleteTarget.id);
      else if (deleteTarget.type === "floor") await floorsAPI.delete(deleteTarget.id);
      else if (deleteTarget.type === "unit") await unitsAPI.delete(deleteTarget.id);
      toast.success(`${deleteTarget.label} deleted`);
      if (deleteTarget.type === "tower" && selectedTowerId === deleteTarget.id) { setSelectedTowerId(null); setSelectedFloorId(null); setSelectedUnitId(null); setActiveStep(0); }
      if (deleteTarget.type === "floor" && selectedFloorId === deleteTarget.id) { setSelectedFloorId(null); setSelectedUnitId(null); setActiveStep(1); }
      if (deleteTarget.type === "unit" && selectedUnitId === deleteTarget.id) { setSelectedUnitId(null); setActiveStep(2); }
      setDeleteTarget(null);
      loadTree();
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!tree) return <Card className="p-8 text-center text-sm text-gray-500">Site not found</Card>;

  return (
    <div>
      <PageHeader
        title={tree.name}
        subtitle={tree.code}
        backTo="/properties"
        actions={
          <div className="flex gap-2">
            {selectedUnit ? (
              <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/units/${selectedUnit.id}/edit`)}>Edit Unit</Button>
            ) : selectedFloor ? (
              <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/floors/${selectedFloor.id}/edit`)}>Edit Floor</Button>
            ) : selectedTower ? (
              <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/towers/${selectedTower.id}/edit`)}>Edit Tower</Button>
            ) : (
              <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/sites/${id}/edit`)}>Edit Site</Button>
            )}
          </div>
        }
      />

      {/* Stat widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Towers", value: towers.length, icon: Layers, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Floors", value: allFloors.length, icon: LayoutGrid, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Units", value: allUnits.length, icon: DoorOpen, bg: "bg-amber-50", text: "text-amber-600" },
          { label: "Amenities", value: siteAmenities.length, icon: Sparkles, bg: "bg-purple-50", text: "text-purple-600" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${item.text}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Stepper steps={steps} activeStep={activeStep} onStepClick={handleStepClick} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4 flex-wrap">
        <button type="button" onClick={() => handleStepClick(0)} className="hover:text-emerald-600">{tree.name}</button>
        {selectedTower && (<><ChevronRight className="w-3.5 h-3.5" /><button type="button" onClick={() => handleStepClick(1)} className="hover:text-emerald-600">{selectedTower.name}</button></>)}
        {selectedFloor && (<><ChevronRight className="w-3.5 h-3.5" /><button type="button" onClick={() => handleStepClick(2)} className="hover:text-emerald-600">Floor {selectedFloor.number}</button></>)}
        {selectedUnit && (<><ChevronRight className="w-3.5 h-3.5" /><span className="text-gray-800 font-medium">{selectedUnit.unit_no}</span></>)}
      </div>

      {/* ===== SITE STEP ===== */}
      {activeStep === 0 && (
        <>
          {/* Basic Info */}
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Basic Info</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Site Name" value={tree.name} />
              <Field label="Code" value={tree.code} mono />
              <Field label="Site Type" value={tree.site_type} badge={tree.site_type === "COMMERCIAL" ? "blue" : tree.site_type === "MIXED" ? "purple" : "emerald"} />
              <Field label="Base Rate" value={tree.base_rate_sqft ? `${fmt(tree.base_rate_sqft)} /sqft` : null} />
            </div>
          </div>

          {/* Address */}
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg mb-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Address</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Address Line 1" value={tree.address_line1} />
              <Field label="Address Line 2" value={tree.address_line2} />
              <Field label="Landmark" value={tree.landmark} />
              <Field label="City" value={tree.city} />
              <Field label="State" value={tree.state} />
              <Field label="Country" value={tree.country} />
              <Field label="Pincode" value={tree.pincode} />
            </div>
          </div>

          {/* Area Details */}
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Area Details</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AreaField label="Total Built-up Area" total={tree.total_builtup_area_sqft} allocated={tree.allocated_total} remaining={tree.remaining_total} />
              <AreaField label="Leasable Area" total={tree.leasable_area_sqft} allocated={tree.allocated_leasable} remaining={tree.remaining_leasable} />
              <Field label="Common Area %" value={tree.common_area_percent ? `${tree.common_area_percent}%` : null} />
              <Field label="Common Area (sqft)" value={tree.common_area_sqft ? fmt(tree.common_area_sqft) : null} />
            </div>
          </div>

          {/* Management & Contract */}
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg mb-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Management & Contract</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Management Fee Type" value={tree.management_fee_type} />
              <Field label="Management Fee Value" value={tree.management_fee_value ? fmt(tree.management_fee_value) : null} />
              <Field label="Contract Start" value={tree.contract_start_date} />
              <Field label="Contract End" value={tree.contract_end_date} />
            </div>
          </div>

          {/* Site Amenities */}
          {siteAmenities.length > 0 && (
            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-700">Site Amenities ({siteAmenities.length})</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {siteAmenities.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    {a.amenity_name || a.amenity || `Amenity #${a.amenity}`}
                    {a.quantity > 1 && <span className="text-gray-400">x{a.quantity}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Towers list */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Towers ({towers.length})</h2>
            <Button size="sm" icon={Plus} onClick={() => navigate(`/properties/towers/create?site=${id}`)}>Add Tower</Button>
          </div>
          {towers.length === 0 ? (
            <Card className="p-8 text-center text-sm text-gray-500">No towers yet. Add your first tower.</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {towers.map((tower) => (
                <Card key={tower.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => selectTower(tower.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div><h3 className="text-sm font-semibold text-gray-800">{tower.name}</h3><p className="text-xs text-gray-500">{tower.code}</p></div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Total Area</p><p className="font-semibold text-gray-800">{fmt(tower.total_area_sqft)} sqft</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Leasable</p><p className="font-semibold text-gray-800">{fmt(tower.leasable_area_sqft)} sqft</p></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== TOWER STEP ===== */}
      {activeStep === 1 && (
        !selectedTower ? <Card className="p-8 text-center text-sm text-gray-500">Select a tower to continue.</Card> : (
          <>
            {/* Tower widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Floors", value: floors.length, icon: LayoutGrid, bg: "bg-blue-50", text: "text-blue-600" },
                { label: "Units", value: floors.reduce((s, f) => s + (f.units?.length || 0), 0), icon: DoorOpen, bg: "bg-amber-50", text: "text-amber-600" },
                { label: "Total Area", value: `${fmt(selectedTower.total_area_sqft)} sqft`, icon: Maximize2, bg: "bg-emerald-50", text: "text-emerald-600" },
                { label: "Leasable Area", value: `${fmt(selectedTower.leasable_area_sqft)} sqft`, icon: LayoutGrid, bg: "bg-purple-50", text: "text-purple-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${item.text}`} /></div>
                    <div><p className="text-lg font-bold text-gray-800">{item.value}</p><p className="text-xs text-gray-500">{item.label}</p></div>
                  </div>
                );
              })}
            </div>

            {/* Tower detail */}
            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Tower Details</h4>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/towers/${selectedTower.id}/edit`)}>Edit</Button>
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget({ type: "tower", id: selectedTower.id, label: selectedTower.name })}>Delete</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Tower Name" value={selectedTower.name} />
                <Field label="Code" value={selectedTower.code} mono />
                <Field label="Building Type" value={selectedTower.building_type} badge="blue" />
                <Field label="Total Floors" value={selectedTower.total_floors} />
                <Field label="Completion Date" value={selectedTower.completion_date} />
                <Field label="Occupancy Date" value={selectedTower.occupancy_date} />
              </div>
            </div>

            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Maximize2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-700">Area Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AreaField label="Total Area" total={selectedTower.total_area_sqft} allocated={selectedTower.allocated_total} remaining={selectedTower.remaining_total} />
                <AreaField label="Leasable Area" total={selectedTower.leasable_area_sqft} allocated={selectedTower.allocated_leasable} remaining={selectedTower.remaining_leasable} />
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Floors ({floors.length})</h2>
              <Button size="sm" icon={Plus} onClick={() => navigate(`/properties/floors/create?site=${id}&tower=${selectedTower.id}`)}>Add Floor</Button>
            </div>
            {floors.length === 0 ? (
              <Card className="p-8 text-center text-sm text-gray-500">No floors yet. Add your first floor.</Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {floors.map((floor) => (
                  <Card key={floor.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => selectFloor(floor.id)}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">Floor {floor.number}{floor.label ? ` - ${floor.label}` : ""}</h3>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Total Area</p><p className="font-semibold text-gray-800">{fmt(floor.total_area_sqft)} sqft</p></div>
                      <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Leasable</p><p className="font-semibold text-gray-800">{fmt(floor.leasable_area_sqft)} sqft</p></div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )
      )}

      {/* ===== FLOOR STEP ===== */}
      {activeStep === 2 && (
        !selectedFloor ? <Card className="p-8 text-center text-sm text-gray-500">Select a floor to continue.</Card> : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Units", value: units.length, icon: DoorOpen, bg: "bg-amber-50", text: "text-amber-600" },
                { label: "Total Area", value: `${fmt(selectedFloor.total_area_sqft)} sqft`, icon: Maximize2, bg: "bg-emerald-50", text: "text-emerald-600" },
                { label: "Leasable Area", value: `${fmt(selectedFloor.leasable_area_sqft)} sqft`, icon: LayoutGrid, bg: "bg-blue-50", text: "text-blue-600" },
                { label: "CAM Area", value: selectedFloor.cam_area_sqft ? `${fmt(selectedFloor.cam_area_sqft)} sqft` : "—", icon: IndianRupee, bg: "bg-purple-50", text: "text-purple-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${item.text}`} /></div>
                    <div><p className="text-lg font-bold text-gray-800">{item.value}</p><p className="text-xs text-gray-500">{item.label}</p></div>
                  </div>
                );
              })}
            </div>

            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Floor Details</h4>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/floors/${selectedFloor.id}/edit`)}>Edit</Button>
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget({ type: "floor", id: selectedFloor.id, label: `Floor ${selectedFloor.number}` })}>Delete</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Floor Number" value={selectedFloor.number} />
                <Field label="Label" value={selectedFloor.label} />
                <Field label="Status" value={selectedFloor.status} badge={selectedFloor.status === "AVAILABLE" ? "emerald" : "blue"} />
                <Field label="Floor Type" value={selectedFloor.floor_type} />
                <Field label="Allowed Use" value={selectedFloor.allowed_use} />
                <Field label="Leasing Type" value={selectedFloor.leasing_type} />
                <Field label="Max Units Allowed" value={selectedFloor.max_units_allowed} />
              </div>
            </div>

            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Maximize2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-700">Area Allocation</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AreaField label="Built-up Area" total={selectedFloor.total_area_sqft} allocated={selectedFloor.allocated_builtup} remaining={selectedFloor.remaining_builtup} />
                <AreaField label="Leasable Area" total={selectedFloor.leasable_area_sqft} allocated={selectedFloor.allocated_leasable} remaining={selectedFloor.remaining_leasable} />
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Units ({units.length})</h2>
              <Button size="sm" icon={Plus} onClick={() => navigate(`/properties/units/create?floor=${selectedFloor.id}`)}>Add Unit</Button>
            </div>
            {units.length === 0 ? (
              <Card className="p-8 text-center text-sm text-gray-500">No units yet. Add your first unit.</Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {units.map((unit) => (
                  <Card key={unit.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => selectUnit(unit.id)}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">{unit.unit_no}</h3>
                      <div className="flex items-center gap-2">
                        <Badge color={unit.status === "AVAILABLE" ? "emerald" : unit.status === "LEASED" ? "blue" : "amber"}>{unit.status}</Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Built-up</p><p className="font-semibold text-gray-800">{fmt(unit.builtup_area_sqft)} sqft</p></div>
                      <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-500">Leasable</p><p className="font-semibold text-gray-800">{fmt(unit.leasable_area_sqft)} sqft</p></div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )
      )}

      {/* ===== UNIT STEP ===== */}
      {activeStep === 3 && (
        !selectedUnit ? <Card className="p-8 text-center text-sm text-gray-500">Select a unit to continue.</Card> : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Leasable Area", value: `${fmt(selectedUnit.leasable_area_sqft)} sqft`, icon: LayoutGrid, bg: "bg-emerald-50", text: "text-emerald-600" },
                { label: "Built-up Area", value: selectedUnit.builtup_area_sqft ? `${fmt(selectedUnit.builtup_area_sqft)} sqft` : "—", icon: Maximize2, bg: "bg-blue-50", text: "text-blue-600" },
                { label: "Base Rent", value: selectedUnit.base_rent_default ? `${fmt(selectedUnit.base_rent_default)} /sqft` : "—", icon: IndianRupee, bg: "bg-amber-50", text: "text-amber-600" },
                { label: "Assets", value: (selectedUnit.assets || []).length, icon: Package, bg: "bg-purple-50", text: "text-purple-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${item.text}`} /></div>
                    <div><p className="text-lg font-bold text-gray-800">{item.value}</p><p className="text-xs text-gray-500">{item.label}</p></div>
                  </div>
                );
              })}
            </div>

            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Unit Details</h4>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/units/${selectedUnit.id}/edit`)}>Edit</Button>
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget({ type: "unit", id: selectedUnit.id, label: selectedUnit.unit_no })}>Delete</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Unit No" value={selectedUnit.unit_no} />
                <Field label="Unit Type" value={selectedUnit.unit_type} badge="purple" />
                <Field label="Status" value={selectedUnit.status} badge={selectedUnit.status === "AVAILABLE" ? "emerald" : selectedUnit.status === "LEASED" ? "blue" : "amber"} />
                <Field label="Divisible" value={selectedUnit.is_divisible ? "Yes" : "No"} />
                <Field label="Leasable Area" value={`${fmt(selectedUnit.leasable_area_sqft)} sqft`} />
                <Field label="Built-up Area" value={selectedUnit.builtup_area_sqft ? `${fmt(selectedUnit.builtup_area_sqft)} sqft` : null} />
                <Field label="Base Rent" value={selectedUnit.base_rent_default ? `${fmt(selectedUnit.base_rent_default)} /sqft` : null} />
                <Field label="CAM Default" value={selectedUnit.cam_default ? fmt(selectedUnit.cam_default) : null} />
                <Field label="Security Deposit" value={selectedUnit.security_deposit_default ? fmt(selectedUnit.security_deposit_default) : null} />
                <Field label="Min Divisible Area" value={selectedUnit.min_divisible_area_sqft ? `${fmt(selectedUnit.min_divisible_area_sqft)} sqft` : null} />
                {selectedUnit.layout_notes && <Field label="Layout Notes" value={selectedUnit.layout_notes} />}
              </div>
            </div>

            {/* Unit Amenities */}
            {unitAmenities.length > 0 && (
              <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Unit Amenities ({unitAmenities.length})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {unitAmenities.map((a) => (
                    <span key={a.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      {a.amenity_name || a.amenity || `Amenity #${a.amenity}`}
                      {a.quantity > 1 && <span className="text-gray-400">x{a.quantity}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Assets */}
            {(selectedUnit.assets || []).length > 0 && (
              <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Assets ({selectedUnit.assets.length})</h4>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Item</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Category</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Qty</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedUnit.assets.map((asset) => (
                        <tr key={asset.id}>
                          <td className="px-4 py-2.5 text-gray-800">{asset.asset_item_name}</td>
                          <td className="px-4 py-2.5 text-gray-500">{asset.category_name}</td>
                          <td className="px-4 py-2.5 text-gray-800 font-medium">{asset.quantity}</td>
                          <td className="px-4 py-2.5 text-gray-500">{asset.condition || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type || "item"}`}
        message={`Are you sure you want to delete "${deleteTarget?.label || ""}"?`}
        loading={deleting}
      />
    </div>
  );
}

/* ── Helper components ────────────────────────────────────────────── */

function Field({ label, value, mono, badge }) {
  const display = value ?? "—";
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      {badge && display !== "—" ? (
        <Badge color={badge}>{display}</Badge>
      ) : (
        <p className={`text-sm text-gray-800 ${mono ? "font-mono" : ""}`}>{display}</p>
      )}
    </div>
  );
}

function AreaField({ label, total, allocated, remaining }) {
  const t = Number(total || 0);
  const a = Number(allocated || 0);
  const r = Number(remaining || 0);
  const pct = t > 0 ? Math.round((a / t) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-800">{t.toLocaleString()} <span className="text-xs text-gray-400">sqft</span></p>
      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="flex justify-between mt-1 text-xs">
        <span className="text-emerald-600">Allocated: {a.toLocaleString()} ({pct}%)</span>
        <span className="text-amber-600">Remaining: {r.toLocaleString()}</span>
      </div>
    </div>
  );
}
