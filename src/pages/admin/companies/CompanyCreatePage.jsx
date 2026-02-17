import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { companiesAPI, orgsAPI } from "../../../services/api";
import { useOrgStructureBasePath } from "../../../contexts/OrgStructureContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const basePath = useOrgStructureBasePath();
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({ org: "", name: "", legal_name: "", registration_number: "", tax_id: "", address: "", city: "", state: "", country: "" });

  useEffect(() => { orgsAPI.list().then((res) => setOrgs(res?.results || res || [])); }, []);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await companiesAPI.create(form);
      toast.success("Company created");
      navigate(`${basePath}/companies`);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Create Company" backTo={`${basePath}/companies`} />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Organization" value={form.org} onChange={set("org")} required options={orgs.map((o) => ({ value: o.id, label: o.name }))} placeholder="Select organization" />
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
            <Button variant="secondary" type="button" onClick={() => navigate(`${basePath}/companies`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
