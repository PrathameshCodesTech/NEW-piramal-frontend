import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link2 } from "lucide-react";
import { usersAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";

const SCOPE_BADGE_COLOR = { ORG: "blue", COMPANY: "purple", ENTITY: "amber", SITE: "emerald" };

export default function UserViewPage() {
  const { id } = useParams();
  const basePath = useUserManagementBasePath();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">User not found</div>;

  const fields = [
    ["Username", data.username],
    ["Email", data.email],
    ["First Name", data.first_name],
    ["Last Name", data.last_name],
  ];

  return (
    <div>
      <PageHeader title={data.username} subtitle="User Details" backTo={`${basePath}/users`} />
      <Card className="p-6 max-w-2xl">
        <div className="flex gap-2 mb-6">
          <Badge color={data.is_active ? "emerald" : "red"}>{data.is_active ? "Active" : "Inactive"}</Badge>
          {data.is_superuser && <Badge color="purple">Super Admin</Badge>}
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-gray-500">{label}</dt>
              <dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd>
            </div>
          ))}
        </dl>

        {data.memberships && data.memberships.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-700">Scope Memberships</h3>
            </div>
            <div className="space-y-2">
              {data.memberships.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <Badge color={SCOPE_BADGE_COLOR[m.scope_type] || "gray"}>
                    {m.scope_type}
                  </Badge>
                  <span className="text-gray-800 font-medium">{m.scope_name}</span>
                  <span className="text-gray-400">as</span>
                  <span className="text-gray-700">{m.role_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
