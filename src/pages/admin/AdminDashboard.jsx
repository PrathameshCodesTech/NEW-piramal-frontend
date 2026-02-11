import { useNavigate } from "react-router-dom";
import { Building2, Layers, MapPin, ShieldCheck, Users, UserCog, Link2 } from "lucide-react";
import Card from "../../components/ui/Card";

const sections = [
  { label: "Organizations", desc: "Manage Orgs", icon: Building2, to: "/admin/orgs", color: "text-emerald-600 bg-emerald-100" },
  { label: "Companies", desc: "Manage Companies", icon: Layers, to: "/admin/companies", color: "text-blue-600 bg-blue-100" },
  { label: "Entities", desc: "Manage Entities", icon: MapPin, to: "/admin/entities", color: "text-purple-600 bg-purple-100" },
  { label: "Scopes", desc: "Manage Tenant Scopes", icon: ShieldCheck, to: "/admin/scopes", color: "text-amber-600 bg-amber-100" },
  { label: "Users", desc: "Manage Users", icon: Users, to: "/admin/users", color: "text-teal-600 bg-teal-100" },
  { label: "Roles", desc: "Manage Roles", icon: UserCog, to: "/admin/roles", color: "text-orange-600 bg-orange-100" },
  { label: "Memberships", desc: "User-Scope-Role links", icon: Link2, to: "/admin/memberships", color: "text-red-600 bg-red-100" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Platform Admin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map((s) => (
          <Card
            key={s.label}
            className="p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(s.to)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
