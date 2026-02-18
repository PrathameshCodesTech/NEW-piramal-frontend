import MiniTable from "../ui/MiniTable";

export default function TablesSection({
  tblUpcoming,
  tblOverdue,
  tblVacantAging,
  onRowClick,
  onViewAll,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <MiniTable
        title="Upcoming Expiries"
        cols={["Tenant", "Rent", "Days Left"]}
        rows={tblUpcoming}
        onRowClick={(row) => onRowClick?.(row, "lease")}
        onViewAll={() => onViewAll?.("Upcoming Expiries", tblUpcoming, ["Tenant", "Rent", "Days Left"])}
      />
      <MiniTable
        title="Top Overdue Tenants"
        cols={["Tenant", "Overdue", "Status"]}
        rows={tblOverdue}
        highlightColumn="Overdue"
        onRowClick={(row) => onRowClick?.(row, "tenant")}
        onViewAll={() => onViewAll?.("Top Overdue Tenants", tblOverdue, ["Tenant", "Overdue", "Status"])}
      />
      <MiniTable
        title="Vacant Units Aging"
        cols={["Unit", "Area", "Vacant Since", "Days"]}
        rows={tblVacantAging}
        onRowClick={(row) => onRowClick?.(row, "unit")}
        onViewAll={() => onViewAll?.("Vacant Units Aging", tblVacantAging, ["Unit", "Area", "Vacant Since", "Days"])}
      />
    </div>
  );
}
