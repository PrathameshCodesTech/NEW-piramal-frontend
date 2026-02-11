import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import DataTable from "./DataTable";
import Button from "./Button";

/** Get value from object by path (supports "summary.units_count") */
function getValue(obj, path) {
  if (!obj || path == null) return undefined;
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

/** Format value for display - only what backend returns, no calculation */
function formatValue(val) {
  if (val === undefined || val === null || val === "") return "—";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

export default function SelectableDataView({
  items = [],
  onSelect,
  fields = [],
  gridFields = [],
  loading = false,
  emptyMessage = "No items",
  icon: Icon,
  onCreateNew,
  createLabel = "Create New",
}) {
  const [viewMode, setViewMode] = useState("grid");
  const gridDisplayFields =
    gridFields.length > 0
      ? gridFields
          .map((key) => fields.find((f) => f.key === key))
          .filter(Boolean)
      : fields.slice(0, 4);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        {emptyMessage}
        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-2 block text-emerald-600 hover:underline"
          >
            {createLabel}
          </button>
        )}
      </div>
    );
  }

  const columns = fields.map((f) => ({
    key: f.key,
    label: f.label,
    render: (row) => formatValue(getValue(row, f.key)),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        {onCreateNew && (
          <Button size="sm" icon={Plus} onClick={onCreateNew}>
            {createLabel}
          </Button>
        )}
      </div>

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const primaryField = gridDisplayFields[0];
            const primaryVal = primaryField ? getValue(item, primaryField.key) : null;
            const stats = gridDisplayFields.slice(1);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect?.(item)}
                className="group text-left rounded-xl border border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 pb-3">
                  {Icon && (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center shrink-0 group-hover:from-emerald-100 group-hover:to-emerald-200/50 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                      {formatValue(primaryVal)}
                    </h4>
                    {primaryField && (
                      <span className="text-xs text-gray-500">{primaryField.label}</span>
                    )}
                  </div>
                </div>
                {stats.length > 0 && (
                  <div className="px-4 pb-4 pt-0 grid grid-cols-2 gap-x-4 gap-y-2">
                    {stats.map((f) => (
                      <div key={f.key} className="flex flex-col">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                          {f.label}
                        </span>
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {formatValue(getValue(item, f.key))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {viewMode === "list" && (
        <DataTable
          columns={columns}
          data={items}
          onRowClick={onSelect}
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  );
}
