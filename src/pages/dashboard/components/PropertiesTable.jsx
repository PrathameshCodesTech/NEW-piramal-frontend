import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Building2 } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

const cn = (...a) => a.filter(Boolean).join(" ");

export default function PropertiesTable({ properties = [] }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800">Properties</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {properties.length} {properties.length === 1 ? "property" : "properties"}
          </span>
          {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {properties.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">No properties available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Property</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Address</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Size</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Occupancy</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {properties.map((p) => {
                    const occupancy = Number(p.occupancy) || 0;
                    const occVariant = occupancy >= 90 ? "success" : occupancy >= 75 ? "warning" : "danger";
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 max-w-[250px] truncate">{p.address || "—"}</td>
                        <td className="px-5 py-3.5 text-right text-gray-600">{p.total_area_label || `${Number(p.total_area_sqft || 0).toLocaleString("en-IN")} sqft`}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Badge variant={occVariant}>{occupancy}%</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={p.status === "Active" ? "success" : "default"}>{p.status || "—"}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => navigate(`/properties/sites/${p.id}`)}
                            className="text-xs text-emerald-600 font-medium hover:underline"
                          >
                            Key details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
