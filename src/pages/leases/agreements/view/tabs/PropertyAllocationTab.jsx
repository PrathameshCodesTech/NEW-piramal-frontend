import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import DataTable from "../../../../../components/ui/DataTable";
import EmptyState from "../../../../../components/ui/EmptyState";
import { ALLOCATION_LEVEL_OPTIONS, ALLOCATION_MODE_OPTIONS } from "../constants";

export default function PropertyAllocationTab({
  allocationForm,
  setAllocationForm,
  floorOptions = [],
  unitOptions = [],
  monthlyRentPreview = null,
  effectiveRatePerSqft = null,
  onCreate,
  savingAllocation,
  allocations,
  allocationsLoading,
  onDelete,
}) {
  const isFloorMode = allocationForm.allocation_level === "FLOOR";

  const renderTarget = (row) => {
    const level = row.target_type || row.allocation_level;
    if (level === "FLOOR") {
      const floor = row.floor_details || row.target_details || {};
      return `Floor ${floor.label || floor.number || row.floor || "-"}`;
    }
    if (level === "TOWER") {
      const tower = row.tower_details || row.target_details || {};
      return tower.name || `Tower ${row.tower || "-"}`;
    }
    if (level === "SITE") {
      const site = row.site_details || row.target_details || {};
      return site.name || `Site ${row.site || "-"}`;
    }
    const unit = row.unit_details || row.target_details || {};
    return unit.unit_no || `Unit ${row.unit || "-"}`;
  };

  const columns = [
    {
      key: "target",
      label: "Target",
      render: (r) => renderTarget(r),
    },
    { key: "allocation_level", label: "Level", render: (r) => r.target_type || r.allocation_level || "-" },
    { key: "allocation_mode", label: "Mode" },
    { key: "allocated_area_sqft", label: "Area (sqft)" },
    { key: "monthly_rent", label: "Monthly Rent" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <button
          type="button"
          className="text-red-600 hover:text-red-700 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(r.id);
          }}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Allocation</h3>
        <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allocate By</label>
            <select
              value={allocationForm.allocation_level}
              onChange={(e) =>
                setAllocationForm((p) => ({
                  ...p,
                  allocation_level: e.target.value,
                  floor: "",
                  unit: "",
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ALLOCATION_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {isFloorMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <select
                required
                value={allocationForm.floor}
                onChange={(e) => setAllocationForm((p) => ({ ...p, floor: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select floor</option>
                {floorOptions.map((f) => (
                  <option key={f.id} value={f.id} disabled={Number(f.available || 0) <= 0}>
                    {f.label} ({Number(f.available || 0).toLocaleString()} sqft free)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                required
                value={allocationForm.unit}
                onChange={(e) => setAllocationForm((p) => ({ ...p, unit: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select unit</option>
                {unitOptions.map((u) => (
                  <option key={u.id} value={u.id} disabled={u.disabled || Number(u.available || 0) <= 0}>
                    {u.label} ({Number(u.available || 0).toLocaleString()} sqft free{u.disabled ? " - blocked" : ""})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={allocationForm.allocation_mode}
              onChange={(e) => setAllocationForm((p) => ({ ...p, allocation_mode: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ALLOCATION_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Allocated Area"
            type="number"
            step="0.01"
            value={allocationForm.allocated_area_sqft}
            onChange={(e) => setAllocationForm((p) => ({ ...p, allocated_area_sqft: e.target.value }))}
            required
          />
          <Input
            label="Monthly Rent (Auto Preview)"
            type="number"
            step="0.01"
            value={monthlyRentPreview ?? ""}
            readOnly
          />
          <div className="sm:col-span-4 -mt-1">
            <p className="text-xs text-gray-500">
              {effectiveRatePerSqft !== null
                ? `Computed as area x rate (${Number(effectiveRatePerSqft).toLocaleString()} per sqft).`
                : "Set Rate / Sqft in Financials (or site base rate) to preview monthly rent."}
            </p>
          </div>
          <div className="sm:col-span-4 flex justify-end">
            <Button type="submit" loading={savingAllocation}>
              Add Allocation
            </Button>
          </div>
        </form>
      </Card>
      <Card>
        {!allocationsLoading && allocations.length === 0 ? (
          <EmptyState title="No allocations" description="Allocate floor or unit space for this agreement." />
        ) : (
          <DataTable columns={columns} data={allocations} loading={allocationsLoading} />
        )}
      </Card>
    </div>
  );
}
