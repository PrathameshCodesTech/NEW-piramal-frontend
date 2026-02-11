import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { scopesAPI, orgsAPI, companiesAPI, entitiesAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

const scopeTypes = [
  { value: "ORG", label: "Organization" },
  { value: "COMPANY", label: "Company" },
  { value: "ENTITY", label: "Entity" },
];

export default function ScopeCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);
  const [form, setForm] = useState({ scope_type: "", name: "", org: "", company: "", entity: "" });

  useEffect(() => {
    if (form.scope_type === "ORG") orgsAPI.list().then((r) => setParents(r?.results || r || []));
    else if (form.scope_type === "COMPANY") companiesAPI.list().then((r) => setParents(r?.results || r || []));
    else if (form.scope_type === "ENTITY") entitiesAPI.list().then((r) => setParents(r?.results || r || []));
    else setParents([]);
  }, [form.scope_type]);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value, ...(f === "scope_type" ? { org: "", company: "", entity: "" } : {}) });

  const parentField = form.scope_type === "ORG" ? "org" : form.scope_type === "COMPANY" ? "company" : form.scope_type === "ENTITY" ? "entity" : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { scope_type: form.scope_type, name: form.name };
    if (parentField) payload[parentField] = form[parentField];
    try { await scopesAPI.create(payload); toast.success("Scope created"); navigate("/admin/scopes"); } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Create Scope" backTo="/admin/scopes" />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Scope Type" value={form.scope_type} onChange={set("scope_type")} required options={scopeTypes} placeholder="Select type" />
          <Input label="Name" value={form.name} onChange={set("name")} required />
          {parentField && (
            <Select
              label={form.scope_type === "ORG" ? "Organization" : form.scope_type === "COMPANY" ? "Company" : "Entity"}
              value={form[parentField]}
              onChange={set(parentField)}
              required
              options={parents.map((p) => ({ value: p.id, label: p.name }))}
              placeholder={`Select ${form.scope_type.toLowerCase()}`}
            />
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/admin/scopes")}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
