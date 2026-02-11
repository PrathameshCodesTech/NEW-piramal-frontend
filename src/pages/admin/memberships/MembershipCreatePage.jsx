import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { membershipsAPI, usersAPI, scopesAPI, rolesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function MembershipCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ user: "", scope: "", role: "" });

  useEffect(() => {
    Promise.all([usersAPI.list(), scopesAPI.list(), rolesAPI.list()]).then(([u, s, r]) => {
      setUsers(u?.results || u || []);
      setScopes(s?.results || s || []);
      setRoles(r?.results || r || []);
    });
  }, []);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await membershipsAPI.create(form); toast.success("Membership created"); navigate("/admin/memberships"); } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Create Membership" backTo="/admin/memberships" />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="User" value={form.user} onChange={set("user")} required options={users.map((u) => ({ value: u.id, label: u.username }))} placeholder="Select user" />
          <Select label="Scope" value={form.scope} onChange={set("scope")} required options={scopes.map((s) => ({ value: s.id, label: `${s.name} (${s.scope_type})` }))} placeholder="Select scope" />
          <Select label="Role" value={form.role} onChange={set("role")} required options={roles.map((r) => ({ value: r.id, label: r.name }))} placeholder="Select role" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/admin/memberships")}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
