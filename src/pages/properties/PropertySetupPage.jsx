import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, MapPin, Wand2 } from "lucide-react";
import { sitesAPI } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";

export default function PropertySetupPage() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sitesAPI.list().then((res) => {
      setSites(res?.results || res || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="Manage your properties and their hierarchy"
        actions={
          <>
            <Button variant="secondary" icon={Wand2} onClick={() => navigate("/properties/setup")}>
              Setup Wizard
            </Button>
            <Button icon={Plus} onClick={() => navigate("/properties/sites/create")}>
              Add Property
            </Button>
          </>
        }
      />

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sites.map((site) => (
            <Card
              key={site.id}
              className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/properties/sites/${site.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{site.name}</h3>
                    <p className="text-xs text-gray-500">{site.code}</p>
                  </div>
                </div>
                <Badge color={site.site_type === "COMMERCIAL" ? "blue" : site.site_type === "MIXED" ? "purple" : "emerald"}>
                  {site.site_type}
                </Badge>
              </div>

              {site.city && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  {[site.city, site.state].filter(Boolean).join(", ")}
                </div>
              )}

              {/* Area summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500">Total Area</p>
                  <p className="font-semibold text-gray-800">
                    {Number(site.total_builtup_area_sqft || 0).toLocaleString()} sqft
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500">Leasable</p>
                  <p className="font-semibold text-gray-800">
                    {Number(site.leasable_area_sqft || 0).toLocaleString()} sqft
                  </p>
                </div>
              </div>

              {/* Summary counts */}
              {site.summary && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>{site.summary.towers_count} Towers</span>
                  <span>{site.summary.floors_count} Floors</span>
                  <span>{site.summary.units_count} Units</span>
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
    </div>
  );
}
