import { Building2, FileCheck, Receipt, Users } from "lucide-react";
import Card from "../../components/ui/Card";

const stats = [
  { label: "Properties", value: "—", icon: Building2, color: "text-emerald-600 bg-emerald-100" },
  { label: "Active Leases", value: "—", icon: FileCheck, color: "text-blue-600 bg-blue-100" },
  { label: "Pending Invoices", value: "—", icon: Receipt, color: "text-amber-600 bg-amber-100" },
  { label: "Tenants", value: "—", icon: Users, color: "text-purple-600 bg-purple-100" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-xl font-semibold text-gray-800">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
