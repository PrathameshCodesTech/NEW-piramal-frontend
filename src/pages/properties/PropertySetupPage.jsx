import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Building2,
  MapPin,
  Wand2,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Layers,
  SquareStack,
  DoorOpen,
  ListFilter,
  Search,
} from "lucide-react";
import { sitesAPI } from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";

const TYPE_COLOR = {
  COMMERCIAL: "blue",
  MIXED: "purple",
  RESIDENTIAL: "emerald",
  INDUSTRIAL: "amber",
  RETAIL: "orange",
};

export default function PropertySetupPage() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");

  useEffect(() => {
    sitesAPI
      .list()
      .then((res) => setSites(res?.results || res || []))
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sites.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.code || "").toLowerCase().includes(q) ||
      (s.city || "").toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: "name",
      label: "Property",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "site_type",
      label: "Type",
      render: (row) => (
        <Badge color={TYPE_COLOR[row.site_type] || "gray"}>{row.site_type}</Badge>
      ),
    },
    {
      key: "city",
      label: "Location",
      render: (row) =>
        row.city ? (
          <span className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {[row.city, row.state].filter(Boolean).join(", ")}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "total_builtup_area_sqft",
      label: "Total Area",
      render: (row) => `${Number(row.total_builtup_area_sqft || 0).toLocaleString()} sqft`,
    },
    {
      key: "leasable_area_sqft",
      label: "Leasable",
      render: (row) => `${Number(row.leasable_area_sqft || 0).toLocaleString()} sqft`,
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/properties/sites/${row.id}`); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/properties/sites/${row.id}/edit`); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold text-gray-800">Properties</h1>
          <span className="text-sm text-gray-400">—</span>
          <p className="text-sm text-gray-500">Manage your properties and their hierarchy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Wand2} onClick={() => navigate("/properties/setup")}>
            Setup Wizard
          </Button>
          <Button icon={Plus} onClick={() => navigate("/properties/sites/create")}>
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{sites.length}</p>
            <p className="text-xs text-gray-500">Properties</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {sites.reduce((sum, s) => sum + (s.summary?.towers_count || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Towers</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <SquareStack className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {sites.reduce((sum, s) => sum + (s.summary?.floors_count || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Floors</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {sites.reduce((sum, s) => sum + (s.summary?.units_count || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Units</p>
          </div>
        </div>
      </div>

      {sites.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No properties yet"
            description="Create your first property to set up towers, floors and units"
            actionLabel="Add Property"
            onAction={() => navigate("/properties/sites/create")}
          />
        </Card>
      ) : (
        <>
          {/* Filter + View Toggle */}
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-700">Filter</h4>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    view === "grid"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-md transition-colors ${
                    view === "list"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Input
                icon={Search}
                placeholder="Search properties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Grid View */}
          {view === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((site) => (
                <Card key={site.id} className="p-5 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">{site.name}</h3>
                        <p className="text-xs text-gray-400">{site.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/properties/sites/${site.id}`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/properties/sites/${site.id}/edit`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    {site.city ? (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {[site.city, site.state].filter(Boolean).join(", ")}
                      </div>
                    ) : (
                      <div />
                    )}
                    <Badge color={TYPE_COLOR[site.site_type] || "gray"}>
                      {site.site_type}
                    </Badge>
                  </div>

                  {/* Area summary */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-500">Total Area</p>
                      <p className="font-semibold text-gray-800">
                        {Number(site.total_builtup_area_sqft || 0).toLocaleString()} sqft
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-500">Leasable</p>
                      <p className="font-semibold text-gray-800">
                        {Number(site.leasable_area_sqft || 0).toLocaleString()} sqft
                      </p>
                    </div>
                  </div>

                  {/* Summary counts */}
                  {site.summary && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" /> {site.summary.towers_count} Towers
                      </span>
                      <span className="flex items-center gap-1">
                        <SquareStack className="w-3 h-3" /> {site.summary.floors_count} Floors
                      </span>
                      <span className="flex items-center gap-1">
                        <DoorOpen className="w-3 h-3" /> {site.summary.units_count} Units
                      </span>
                      {site.summary.occupancy_percent > 0 && (
                        <span className="ml-auto text-emerald-600 font-medium">
                          {site.summary.occupancy_percent}% Occupied
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {view === "list" && (
            <Card>
              <DataTable
                columns={columns}
                data={filtered}
                loading={false}
                onRowClick={(row) => navigate(`/properties/sites/${row.id}`)}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
