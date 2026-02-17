import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { rolesAPI, scopesAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function RoleCreatePage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const [loading, setLoading] = useState(false);
  const [scopes, setScopes] = useState([]);
  const [form, setForm] = useState({ name: "", scope: "", description: "" });

  useEffect(() => { scopesAPI.list().then((res) => setScopes(res?.results || res || [])); }, []);
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await rolesAPI.create(form); toast.success("Role created"); navigate(`${basePath}/roles`); } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Create Role" backTo={`${basePath}/roles`} />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={set("name")} required />
          <Select label="Scope" value={form.scope} onChange={set("scope")} required options={scopes.map((s) => ({ value: s.id, label: `${s.name} (${s.scope_type})` }))} placeholder="Select scope" />
          <Input label="Description" value={form.description} onChange={set("description")} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(`${basePath}/roles`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
