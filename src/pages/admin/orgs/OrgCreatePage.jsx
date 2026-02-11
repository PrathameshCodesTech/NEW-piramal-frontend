import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { orgsAPI } from "../../../services/api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Card from "../../../components/ui/Card";

export default function OrgCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", legal_name: "", registration_number: "", tax_id: "",
    address: "", city: "", state: "", country: "",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orgsAPI.create(form);
      toast.success("Organization created");
      navigate("/admin/orgs");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Organization" backTo="/admin/orgs" />
      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button variant="secondary" type="button" onClick={() => navigate("/admin/orgs")}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
