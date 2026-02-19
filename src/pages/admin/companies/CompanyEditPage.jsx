import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { companiesAPI, orgsAPI } from "../../../services/api";
import { useOrgStructureBasePath } from "../../../contexts/OrgStructureContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function CompanyEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useOrgStructureBasePath();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({ org: "", name: "", code: "", legal_name: "", registration_number: "", tax_id: "", address: "", city: "", state: "", country: "" });

  useEffect(() => {
    Promise.all([companiesAPI.get(id), orgsAPI.list()]).then(([res, orgRes]) => {
      setForm({ org: res.org || "", name: res.name || "", code: res.code || "", legal_name: res.legal_name || "", registration_number: res.registration_number || "", tax_id: res.tax_id || "", address: res.address || "", city: res.city || "", state: res.state || "", country: res.country || "" });
      setOrgs(orgRes?.results || orgRes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await companiesAPI.update(id, form); toast.success("Company updated"); navigate(`${basePath}/companies/${id}`); } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Edit Company" backTo={`${basePath}/companies/${id}`} />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Organization" value={form.org} onChange={set("org")} required options={orgs.map((o) => ({ value: o.id, label: o.name }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={set("name")} required />
            <Input label="Code" value={form.code} onChange={set("code")} required placeholder="e.g. luminaire-realty" />
            <Input label="Legal Name" value={form.legal_name} onChange={set("legal_name")} />
            <Input label="Registration Number" value={form.registration_number} onChange={set("registration_number")} />
            <Input label="Tax ID" value={form.tax_id} onChange={set("tax_id")} />
            <Input label="City" value={form.city} onChange={set("city")} />
            <Input label="State" value={form.state} onChange={set("state")} />
            <Input label="Country" value={form.country} onChange={set("country")} />
          </div>
          <Input label="Address" value={form.address} onChange={set("address")} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(`${basePath}/companies/${id}`)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
