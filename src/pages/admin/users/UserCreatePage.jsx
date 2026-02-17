import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { usersAPI, rolesAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import ScopeFilterDropdown from "../../../components/ui/ScopeFilterDropdown";

export default function UserCreatePage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const [loading, setLoading] = useState(false);
  const [scopeRoles, setScopeRoles] = useState([]);
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    first_name: "", last_name: "", is_superuser: false,
    scope_id: "", role_id: "",
  });

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  useEffect(() => {
    if (form.scope_id) {
      rolesAPI.list({ scope_id: form.scope_id }).then((res) => {
        setScopeRoles(res?.results || res || []);
      });
    } else {
      setScopeRoles([]);
    }
  }, [form.scope_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.scope_id) { delete payload.scope_id; delete payload.role_id; }
      if (!payload.role_id) delete payload.role_id;
      await usersAPI.create(payload);
      toast.success("User created");
      navigate(`${basePath}/users`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create User" backTo={`${basePath}/users`} />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Username" value={form.username} onChange={set("username")} required />
            <Input label="Email" type="email" value={form.email} onChange={set("email")} required />
            <Input label="Password" type="password" value={form.password} onChange={set("password")} required />
            <Input label="First Name" value={form.first_name} onChange={set("first_name")} />
            <Input label="Last Name" value={form.last_name} onChange={set("last_name")} />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Scope Assignment (optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScopeFilterDropdown
                value={form.scope_id}
                onChange={(val) => setForm({ ...form, scope_id: val, role_id: "" })}
                label="Assign to Scope"
              />
              <Select
                label="Role in Scope"
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                options={scopeRoles.map((r) => ({ value: r.id, label: r.name }))}
                placeholder={form.scope_id ? "Select role..." : "Select scope first"}
                disabled={!form.scope_id}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_superuser} onChange={(e) => setForm({ ...form, is_superuser: e.target.checked })} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            Super Admin
          </label>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(`${basePath}/users`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
