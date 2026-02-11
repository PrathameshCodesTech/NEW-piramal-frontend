import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import DataTable from "../../../../../components/ui/DataTable";
import EmptyState from "../../../../../components/ui/EmptyState";
import { ALLOCATION_MODE_OPTIONS } from "../constants";

export default function PropertyAllocationTab({
  allocationForm,
  setAllocationForm,
  unitOptions,
  onCreate,
  savingAllocation,
  allocations,
  allocationsLoading,
  onDelete,
}) {
  const columns = [
    { key: "unit", label: "Unit", render: (r) => r.unit_details?.unit_no || `Unit ${r.unit}` },
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
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Unit Allocation</h3>
        <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <option key={u.id} value={u.id}>
                  {u.label} ({Number(u.available || 0).toLocaleString()} sqft free)
                </option>
              ))}
            </select>
          </div>
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
            label="Monthly Rent"
            type="number"
            step="0.01"
            value={allocationForm.monthly_rent}
            onChange={(e) => setAllocationForm((p) => ({ ...p, monthly_rent: e.target.value }))}
          />
          <div className="sm:col-span-4 flex justify-end">
            <Button type="submit" loading={savingAllocation}>
              Add Allocation
            </Button>
          </div>
        </form>
      </Card>
      <Card>
        {!allocationsLoading && allocations.length === 0 ? (
          <EmptyState title="No allocations" description="Allocate units for this agreement." />
        ) : (
          <DataTable columns={columns} data={allocations} loading={allocationsLoading} />
        )}
      </Card>
    </div>
  );
}

