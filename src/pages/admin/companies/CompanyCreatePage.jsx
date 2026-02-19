import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Layers } from "lucide-react";
import { companiesAPI, orgsAPI } from "../../../services/api";
import { useOrgStructureBasePath } from "../../../contexts/OrgStructureContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const basePath = useOrgStructureBasePath();
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({
    org: "", name: "", code: "",
    legal_name: "", registration_number: "", tax_id: "",
    address: "", city: "", state: "", country: "",
  });

  useEffect(() => { orgsAPI.list().then((res) => setOrgs(res?.results || res || [])); }, []);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev, name,
      code: prev.code || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await companiesAPI.create(form);
      toast.success("Company created successfully. Default roles (Admin, Manager, Staff, Viewer) have been seeded for this scope.");
      navigate(`${basePath}/companies`);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Create Company" subtitle="Add a new company under an organization. Code must be unique within the organization." backTo={`${basePath}/companies`} />
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-white rounded-r-lg shadow-sm border border-gray-200 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Company Details</h4>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Organization" value={form.org} onChange={set("org")} required options={orgs.map((o) => ({ value: o.id, label: o.name }))} placeholder="Select organization" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={handleNameChange} placeholder="e.g. Luminaire Realty Pvt Ltd" required />
            <Input label="Code" value={form.code} onChange={set("code")} placeholder="e.g. luminaire-realty" required />
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
            <Button type="submit" loading={loading}>Create Company</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
