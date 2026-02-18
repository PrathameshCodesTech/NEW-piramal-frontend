import { Filter, Loader2, RefreshCw, Download, Building2, ChevronDown } from "lucide-react";

const cn = (...a) => a.filter(Boolean).join(" ");

function Button({ children, variant = "primary", size = "md", className, ...props }) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export default function DashboardHeader({
  loading,
  onRefresh,
  onOpenFilters,
  filterOptions,
  selectedSiteIds,
  onSelectedSiteIdsChange,
  propertyDropdownOpen,
  onPropertyDropdownToggle,
  onPropertyDropdownClose,
}) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Overview of your property portfolio</p>
            </div>
            <div className="hidden md:block relative">
              <button
                type="button"
                onClick={onPropertyDropdownToggle}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {selectedSiteIds.length === 0
                    ? "All Properties"
                    : selectedSiteIds.length === (filterOptions?.sites?.length || 0)
                      ? "All Properties"
                      : `${selectedSiteIds.length} selected`}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", propertyDropdownOpen && "rotate-180")} />
              </button>
              {propertyDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={onPropertyDropdownClose} />
                  <div className="absolute left-0 top-full mt-1 z-20 min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                    <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Properties</p>
                    {(filterOptions?.sites || []).map((s) => (
                      <label key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSiteIds.includes(String(s.id))}
                          onChange={() => {
                            const id = String(s.id);
                            onSelectedSiteIdsChange(
                              selectedSiteIds.includes(id)
                                ? selectedSiteIds.filter((x) => x !== id)
                                : [...selectedSiteIds, id]
                            );
                          }}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-800">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            )}
            <Button variant="secondary" onClick={onRefresh} disabled={loading} className="p-2.5">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="secondary" className="p-2.5">
              <Download className="w-4 h-4" />
            </Button>
            <Button onClick={onOpenFilters}>
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
