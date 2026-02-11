import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2, Layers, LayoutGrid, DoorOpen,
  Plus, Pencil, Trash2, ChevronRight, MapPin, ArrowLeft,
} from "lucide-react";
import { sitesAPI, towersAPI, floorsAPI, unitsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import AreaCard from "../../../components/ui/AreaCard";
import Stepper from "../../../components/ui/Stepper";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

export default function SiteViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  // Navigation state within tree
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTower, setSelectedTower] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadTree = () => {
    setLoading(true);
    sitesAPI.fullTree(id).then((res) => {
      setTree(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadTree(); }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!tree) return <div className="text-center py-12 text-gray-500">Site not found</div>;

  const towers = tree.towers || [];
  const tower = selectedTower ? towers.find((t) => t.id === selectedTower) : null;
  const floors = tower?.floors || [];
  const floor = selectedFloor ? floors.find((f) => f.id === selectedFloor) : null;
  const units = floor?.units || [];
  const unit = selectedUnit ? units.find((u) => u.id === selectedUnit) : null;

  const allFloors = towers.flatMap((t) => t.floors || []);
  const allUnits = allFloors.flatMap((f) => f.units || []);

  const steps = [
    { label: "Site", icon: Building2, count: 1 },
    { label: "Towers", icon: Layers, count: towers.length },
    { label: "Floors", icon: LayoutGrid, count: tower ? floors.length : allFloors.length },
    { label: "Units", icon: DoorOpen, count: floor ? units.length : allUnits.length },
  ];

  const handleStepClick = (step) => {
    if (step <= activeStep) {
      // Going backward — reset deeper selections
      if (step < 3) setSelectedUnit(null);
      if (step < 2) setSelectedFloor(null);
      if (step < 1) setSelectedTower(null);
      setActiveStep(step);
      return;
    }

    // Going forward — auto-select first available items
    let tw = selectedTower;
    let fl = selectedFloor;
    let un = selectedUnit;

    if (step >= 1 && !tw && towers.length > 0) {
      tw = towers[0].id;
      setSelectedTower(tw);
    }
    if (step >= 2 && !fl) {
      const t = towers.find((t) => t.id === tw);
      const fls = t?.floors || [];
      if (fls.length > 0) { fl = fls[0].id; setSelectedFloor(fl); }
    }
    if (step >= 3 && !un) {
      const t = towers.find((t) => t.id === tw);
      const f = (t?.floors || []).find((f) => f.id === fl);
      const us = f?.units || [];
      if (us.length > 0) { un = us[0].id; setSelectedUnit(un); }
    }

    setActiveStep(step);
  };

  const selectTower = (towerId) => {
    setSelectedTower(towerId);
    setSelectedFloor(null);
    setSelectedUnit(null);
    setActiveStep(1);
  };

  const selectFloor = (floorId) => {
    setSelectedFloor(floorId);
    setSelectedUnit(null);
    setActiveStep(2);
  };

  const selectUnit = (unitId) => {
    setSelectedUnit(unitId);
    setActiveStep(3);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { type, id: targetId, label } = deleteTarget;
      if (type === "tower") await towersAPI.delete(targetId);
      else if (type === "floor") await floorsAPI.delete(targetId);
      else if (type === "unit") await unitsAPI.delete(targetId);
      toast.success(`${label} deleted`);
      setDeleteTarget(null);
      // Reset selection if deleted item was selected
      if (type === "tower" && selectedTower === targetId) {
        setSelectedTower(null); setActiveStep(0);
      }
      if (type === "floor" && selectedFloor === targetId) {
        setSelectedFloor(null); setActiveStep(1);
      }
      if (type === "unit" && selectedUnit === targetId) {
        setSelectedUnit(null); setActiveStep(2);
      }
      loadTree();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  // ── Breadcrumb ──────────────────────────────────────────────────────
  const breadcrumbs = [{ label: tree.name, onClick: () => handleStepClick(0) }];
  if (tower) breadcrumbs.push({ label: tower.name, onClick: () => handleStepClick(1) });
  if (floor) breadcrumbs.push({ label: `Floor ${floor.number}${floor.label ? ` - ${floor.label}` : ""}`, onClick: () => handleStepClick(2) });
  if (unit) breadcrumbs.push({ label: unit.unit_no });

  return (
    <div>
      <PageHeader
        title={tree.name}
        subtitle={tree.code}
        backTo="/properties"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/sites/${id}/edit`)}>Edit Site</Button>
          </div>
        }
      />

      {/* Stepper */}
      <Stepper steps={steps} activeStep={activeStep} onStepClick={handleStepClick} />

      {/* Breadcrumb trail */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4 flex-wrap">
        {breadcrumbs.map((bc, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
            {bc.onClick ? (
              <button onClick={bc.onClick} className="hover:text-emerald-600 transition-colors cursor-pointer">
                {bc.label}
              </button>
            ) : (
              <span className="text-gray-800 font-medium">{bc.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* ── Step 0: Site Overview ─────────────────────────────────────── */}
      {activeStep === 0 && (
        <>
          {/* Site info row */}
          <Card className="p-5 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge color={tree.site_type === "COMMERCIAL" ? "blue" : tree.site_type === "MIXED" ? "purple" : "emerald"}>
                    {tree.site_type}
                  </Badge>
                </div>
                {tree.city && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {[tree.address_line1, tree.city, tree.state].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-gray-500">
                {tree.contract_start_date && <p>Contract: {tree.contract_start_date} — {tree.contract_end_date || "ongoing"}</p>}
                {tree.base_rate_sqft && <p>Base Rate: {fmt(tree.base_rate_sqft)} /sqft</p>}
              </div>
            </div>

            {/* Area widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <AreaCard
                label="Total Built-up Area"
                total={Number(tree.total_builtup_area_sqft || 0)}
                allocated={Number(tree.allocated_total || 0)}
                remaining={Number(tree.remaining_total || 0)}
              />
              <AreaCard
                label="Leasable Area"
                total={Number(tree.leasable_area_sqft || 0)}
                allocated={Number(tree.allocated_leasable || 0)}
                remaining={Number(tree.remaining_leasable || 0)}
              />
              {tree.common_area_sqft > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Common Area</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {fmt(tree.common_area_sqft)} <span className="text-xs text-gray-400">sqft</span>
                  </p>
                  {tree.common_area_percent > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{Number(tree.common_area_percent)}%</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Towers list */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Towers ({towers.length})</h2>
            <Button size="sm" icon={Plus} onClick={() => navigate(`/properties/towers/create?site=${id}`)}>
              Add Tower
            </Button>
          </div>

          {towers.length === 0 ? (
            <Card className="p-8 text-center text-sm text-gray-500">
              No towers yet. Add your first tower to this site.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {towers.map((t) => (
                <Card
                  key={t.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => selectTower(t.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{t.name}</h3>
                      <p className="text-xs text-gray-500">{t.code}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {t.building_type && <Badge color="blue">{t.building_type}</Badge>}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Total Area</p>
                      <p className="font-semibold text-gray-800">{fmt(t.total_area_sqft)} sqft</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Leasable</p>
                      <p className="font-semibold text-gray-800">{fmt(t.leasable_area_sqft)} sqft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{(t.floors || []).length} Floors</span>
                    <span>{t.total_floors || 0} Total Floors</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Step 1: Tower Detail ──────────────────────────────────────── */}
      {activeStep === 1 && !tower && (
        <Card className="p-8 text-center text-sm text-gray-500">
          No towers yet. Go to the Site tab to add towers.
        </Card>
      )}
      {activeStep === 1 && tower && (
        <>
          <Card className="p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">{tower.name}</h2>
                <p className="text-xs text-gray-500">{tower.code}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/towers/${tower.id}/edit`)}>Edit</Button>
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget({ type: "tower", id: tower.id, label: tower.name })}>Delete</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <AreaCard
                label="Total Area"
                total={Number(tower.total_area_sqft || 0)}
                allocated={Number(tower.allocated_total || 0)}
                remaining={Number(tower.remaining_total || 0)}
              />
              <AreaCard
                label="Leasable Area"
                total={Number(tower.leasable_area_sqft || 0)}
                allocated={Number(tower.allocated_leasable || 0)}
                remaining={Number(tower.remaining_leasable || 0)}
              />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Info</p>
                <div className="space-y-1 text-xs">
                  {tower.building_type && <p><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-800">{tower.building_type}</span></p>}
                  {tower.total_floors && <p><span className="text-gray-500">Total Floors:</span> <span className="font-medium text-gray-800">{tower.total_floors}</span></p>}
                  {tower.completion_date && <p><span className="text-gray-500">Completion:</span> <span className="font-medium text-gray-800">{tower.completion_date}</span></p>}
                  {tower.occupancy_date && <p><span className="text-gray-500">Occupancy:</span> <span className="font-medium text-gray-800">{tower.occupancy_date}</span></p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Floors list */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Floors ({floors.length})</h2>
            <Button size="sm" icon={Plus} onClick={() => navigate(`/properties/floors/create?site=${id}&tower=${tower.id}`)}>
              Add Floor
            </Button>
          </div>

          {floors.length === 0 ? (
            <Card className="p-8 text-center text-sm text-gray-500">
              No floors yet. Add your first floor to this tower.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {floors.map((f) => (
                <Card
                  key={f.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => selectFloor(f.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Floor {f.number}{f.label ? ` — ${f.label}` : ""}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge color={f.status === "AVAILABLE" ? "emerald" : f.status === "LEASED" ? "blue" : "amber"}>
                        {f.status}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Total Area</p>
                      <p className="font-semibold text-gray-800">{fmt(f.total_area_sqft)} sqft</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Leasable</p>
                      <p className="font-semibold text-gray-800">{fmt(f.leasable_area_sqft)} sqft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{(f.units || []).length} Units</span>
                    {f.floor_type && <span>Type: {f.floor_type}</span>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Step 2: Floor Detail ──────────────────────────────────────── */}
      {activeStep === 2 && !floor && (
        <Card className="p-8 text-center text-sm text-gray-500">
          No floors yet. Select a tower and add floors first.
        </Card>
      )}
      {activeStep === 2 && floor && (
        <>
          <Card className="p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Floor {floor.number}{floor.label ? ` — ${floor.label}` : ""}
                </h2>
                <Badge color={floor.status === "AVAILABLE" ? "emerald" : floor.status === "LEASED" ? "blue" : "amber"}>
                  {floor.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/floors/${floor.id}/edit`)}>Edit</Button>
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget({ type: "floor", id: floor.id, label: `Floor ${floor.number}` })}>Delete</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <AreaCard
                label="Total Area"
                total={Number(floor.total_area_sqft || 0)}
                allocated={Number(floor.allocated_builtup || 0)}
                remaining={Number(floor.remaining_builtup || 0)}
              />
              <AreaCard
                label="Leasable Area"
                total={Number(floor.leasable_area_sqft || 0)}
                allocated={Number(floor.allocated_leasable || 0)}
                remaining={Number(floor.remaining_leasable || 0)}
              />
              {Number(floor.cam_area_sqft || 0) > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">CAM Area</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {fmt(floor.cam_area_sqft)} <span className="text-xs text-gray-400">sqft</span>
                  </p>
                </div>
              )}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Info</p>
                <div className="space-y-1 text-xs">
                  {floor.floor_type && <p><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-800">{floor.floor_type}</span></p>}
                  {floor.allowed_use && <p><span className="text-gray-500">Allowed Use:</span> <span className="font-medium text-gray-800">{floor.allowed_use}</span></p>}
                  {floor.leasing_type && <p><span className="text-gray-500">Leasing Type:</span> <span className="font-medium text-gray-800">{floor.leasing_type}</span></p>}
                  {floor.max_units_allowed && <p><span className="text-gray-500">Max Units:</span> <span className="font-medium text-gray-800">{floor.max_units_allowed}</span></p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Units list */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Units ({units.length})</h2>
            <Button size="sm" icon={Plus} onClick={() => navigate(`/properties/units/create?floor=${floor.id}`)}>
              Add Unit
            </Button>
          </div>

          {units.length === 0 ? (
            <Card className="p-8 text-center text-sm text-gray-500">
              No units yet. Add your first unit to this floor.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {units.map((u) => (
                <Card
                  key={u.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => selectUnit(u.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">{u.unit_no}</h3>
                    <div className="flex items-center gap-1">
                      <Badge color={u.status === "AVAILABLE" ? "emerald" : u.status === "LEASED" ? "blue" : u.status === "HOLD" ? "amber" : "gray"}>
                        {u.status}
                      </Badge>
                      <Badge color="purple">{u.unit_type}</Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Built-up</p>
                      <p className="font-semibold text-gray-800">{fmt(u.builtup_area_sqft)} sqft</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Leasable</p>
                      <p className="font-semibold text-gray-800">{fmt(u.leasable_area_sqft)} sqft</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Step 3: Unit Detail ───────────────────────────────────────── */}
      {activeStep === 3 && !unit && (
        <Card className="p-8 text-center text-sm text-gray-500">
          No units yet. Select a floor and add units first.
        </Card>
      )}
      {activeStep === 3 && unit && (
        <>
          <Card className="p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">{unit.unit_no}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={unit.status === "AVAILABLE" ? "emerald" : unit.status === "LEASED" ? "blue" : unit.status === "HOLD" ? "amber" : "gray"}>
                    {unit.status}
                  </Badge>
                  <Badge color="purple">{unit.unit_type}</Badge>
                  {unit.is_divisible && <Badge color="orange">Divisible</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" icon={Pencil} onClick={() => navigate(`/properties/units/${unit.id}/edit`)}>Edit</Button>
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget({ type: "unit", id: unit.id, label: unit.unit_no })}>Delete</Button>
              </div>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <dt className="text-gray-500">Built-up Area</dt>
                <dd className="font-semibold text-gray-800 mt-0.5">{fmt(unit.builtup_area_sqft)} sqft</dd>
              </div>
              <div>
                <dt className="text-gray-500">Leasable Area</dt>
                <dd className="font-semibold text-gray-800 mt-0.5">{fmt(unit.leasable_area_sqft)} sqft</dd>
              </div>
              {unit.base_rent_default && (
                <div>
                  <dt className="text-gray-500">Base Rent</dt>
                  <dd className="font-semibold text-gray-800 mt-0.5">{fmt(unit.base_rent_default)} /sqft</dd>
                </div>
              )}
              {unit.cam_default && (
                <div>
                  <dt className="text-gray-500">CAM Default</dt>
                  <dd className="font-semibold text-gray-800 mt-0.5">{fmt(unit.cam_default)} /sqft</dd>
                </div>
              )}
              {unit.security_deposit_default && (
                <div>
                  <dt className="text-gray-500">Security Deposit</dt>
                  <dd className="font-semibold text-gray-800 mt-0.5">{fmt(unit.security_deposit_default)}</dd>
                </div>
              )}
              {unit.is_divisible && unit.min_divisible_area_sqft && (
                <div>
                  <dt className="text-gray-500">Min Divisible</dt>
                  <dd className="font-semibold text-gray-800 mt-0.5">{fmt(unit.min_divisible_area_sqft)} sqft</dd>
                </div>
              )}
              {unit.layout_notes && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Layout Notes</dt>
                  <dd className="font-medium text-gray-800 mt-0.5">{unit.layout_notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Assets */}
          {(unit.assets || []).length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Assets ({unit.assets.length})</h2>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Item</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Category</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Qty</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unit.assets.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50">
                        <td className="px-4 py-2 text-gray-800">{a.asset_item_name}</td>
                        <td className="px-4 py-2 text-gray-500">{a.category_name}</td>
                        <td className="px-4 py-2 text-gray-800">{a.quantity}</td>
                        <td className="px-4 py-2 text-gray-500">{a.condition || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type}`}
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This will also delete all child items.`}
        loading={deleting}
      />
    </div>
  );
}
