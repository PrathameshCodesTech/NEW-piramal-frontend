import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";

export default function UserViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { usersAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">User not found</div>;

  const fields = [["Username", data.username], ["Email", data.email], ["First Name", data.first_name], ["Last Name", data.last_name]];

  return (
    <div>
      <PageHeader title={data.username} subtitle="User Details" backTo="/admin/users" />
      <Card className="p-6 max-w-2xl">
        <div className="flex gap-2 mb-6">
          <Badge color={data.is_active ? "emerald" : "red"}>{data.is_active ? "Active" : "Inactive"}</Badge>
          {data.is_superuser && <Badge color="purple">Super Admin</Badge>}
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map(([label, value]) => (<div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd></div>))}
        </dl>
      </Card>
    </div>
  );
}
