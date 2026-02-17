import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { entitiesAPI, companiesAPI } from "../../../services/api";
import { useOrgStructureBasePath } from "../../../contexts/OrgStructureContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function EntityEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useOrgStructureBasePath();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ company: "", name: "", legal_name: "", registration_number: "", tax_id: "", address: "", city: "", state: "", country: "" });

  useEffect(() => {
    Promise.all([entitiesAPI.get(id), companiesAPI.list()]).then(([res, compRes]) => {
      setForm({ company: res.company || "", name: res.name || "", legal_name: res.legal_name || "", registration_number: res.registration_number || "", tax_id: res.tax_id || "", address: res.address || "", city: res.city || "", state: res.state || "", country: res.country || "" });
      setCompanies(compRes?.results || compRes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await entitiesAPI.update(id, form); toast.success("Entity updated"); navigate(`${basePath}/entities/${id}`); } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Edit Entity" backTo={`${basePath}/entities/${id}`} />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Company" value={form.company} onChange={set("company")} required options={companies.map((c) => ({ value: c.id, label: c.name }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={set("name")} required />
            <Input label="Legal Name" value={form.legal_name} onChange={set("legal_name")} />
            <Input label="Registration Number" value={form.registration_number} onChange={set("registration_number")} />
            <Input label="Tax ID" value={form.tax_id} onChange={set("tax_id")} />
            <Input label="City" value={form.city} onChange={set("city")} />
            <Input label="State" value={form.state} onChange={set("state")} />
            <Input label="Country" value={form.country} onChange={set("country")} />
          </div>
          <Input label="Address" value={form.address} onChange={set("address")} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(`${basePath}/entities/${id}`)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
