import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { membershipsAPI, usersAPI, rolesAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import ScopeFilterDropdown from "../../../components/ui/ScopeFilterDropdown";

export default function MembershipCreatePage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ user: "", scope: "", role: "" });

  useEffect(() => {
    usersAPI.list().then((res) => {
      setUsers(res?.results || res || []);
    });
  }, []);

  useEffect(() => {
    if (form.scope) {
      rolesAPI.list({ scope_id: form.scope }).then((res) => {
        setRoles(res?.results || res || []);
      });
    } else {
      setRoles([]);
    }
  }, [form.scope]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await membershipsAPI.create(form);
      toast.success("Membership created");
      navigate(`${basePath}/memberships`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Membership" backTo={`${basePath}/memberships`} />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="User"
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            required
            options={users.map((u) => ({ value: u.id, label: u.email || u.username }))}
            placeholder="Select user"
          />
          <ScopeFilterDropdown
            value={form.scope}
            onChange={(val) => setForm({ ...form, scope: val, role: "" })}
            label="Scope"
            showAll={false}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
            placeholder={form.scope ? "Select role..." : "Select scope first"}
            disabled={!form.scope}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(`${basePath}/memberships`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
