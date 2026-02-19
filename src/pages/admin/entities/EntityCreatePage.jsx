import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import { entitiesAPI, companiesAPI } from "../../../services/api";
import { useOrgStructureBasePath } from "../../../contexts/OrgStructureContext";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

export default function EntityCreatePage() {
  const navigate = useNavigate();
  const basePath = useOrgStructureBasePath();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    company: "",
    name: "",
    code: "",
    legal_name: "",
    registration_number: "",
    tax_id: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  useEffect(() => { companiesAPI.list().then((res) => setCompanies(res?.results || res || [])); }, []);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      code: prev.code || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await entitiesAPI.create(form);
      toast.success("Entity created successfully. Default roles (Admin, Manager, Staff, Viewer) have been seeded for this scope.");
      navigate(`${basePath}/entities`);
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="Create Entity"
        subtitle="Add a new entity under a company. Code must be unique within the company."
        backTo={`${basePath}/entities`}
      />
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-white rounded-r-lg shadow-sm border border-gray-200 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Entity Details</h4>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Company"
            value={form.company}
            onChange={set("company")}
            required
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select company"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={handleNameChange} placeholder="e.g. Luminaire Mumbai Entity" required />
            <Input label="Code" value={form.code} onChange={set("code")} placeholder="e.g. luminaire-mumbai" required />
            <Input label="Legal Name" value={form.legal_name} onChange={set("legal_name")} />
            <Input label="Registration Number" value={form.registration_number} onChange={set("registration_number")} />
            <Input label="Tax ID" value={form.tax_id} onChange={set("tax_id")} />
            <Input label="City" value={form.city} onChange={set("city")} />
            <Input label="State" value={form.state} onChange={set("state")} />
            <Input label="Country" value={form.country} onChange={set("country")} />
          </div>
          <Input label="Address" value={form.address} onChange={set("address")} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(`${basePath}/entities`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Entity</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
