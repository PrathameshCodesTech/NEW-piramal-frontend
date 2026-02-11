import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Tag, Mail, Phone, Globe, Briefcase, MapPin, Map, Navigation } from "lucide-react";
import { tenantCompaniesAPI } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

const SIZE_OPTIONS = [
  { value: "", label: "Select size" },
  { value: "MICRO", label: "Micro (1-10)" },
  { value: "SMALL", label: "Small (11-50)" },
  { value: "MEDIUM", label: "Medium (51-200)" },
  { value: "LARGE", label: "Large (201-1000)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+)" },
];

export default function TenantEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    legal_name: "", trade_name: "", email: "", phone: "", website: "",
    address_line1: "", address_line2: "", city: "", state: "", pincode: "",
    country: "", status: "ACTIVE", industry: "", company_size: "",
  });

  useEffect(() => {
    tenantCompaniesAPI.get(id).then((res) => {
      setForm({
        legal_name: res.legal_name || "", trade_name: res.trade_name || "",
        email: res.email || "", phone: res.phone || "", website: res.website || "",
        address_line1: res.address_line1 || "", address_line2: res.address_line2 || "",
        city: res.city || "", state: res.state || "", pincode: res.pincode || "",
        country: res.country || "", status: res.status || "ACTIVE",
        industry: res.industry || "", company_size: res.company_size || "",
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tenantCompaniesAPI.update(id, form);
      toast.success("Tenant updated");
      navigate(`/tenants/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Edit Tenant" backTo={`/tenants/${id}`} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Company Information</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Legal Name" icon={Building2} value={form.legal_name} onChange={set("legal_name")} required />
            <Input label="Trade Name" icon={Tag} value={form.trade_name} onChange={set("trade_name")} />
            <Input label="Email" icon={Mail} type="email" value={form.email} onChange={set("email")} />
            <Input label="Phone" icon={Phone} value={form.phone} onChange={set("phone")} />
            <Input label="Website" icon={Globe} value={form.website} onChange={set("website")} />
            <Input label="Industry" icon={Briefcase} value={form.industry} onChange={set("industry")} />
            <Select label="Company Size" value={form.company_size} onChange={set("company_size")} options={SIZE_OPTIONS} />
            <Select label="Status" value={form.status} onChange={set("status")} options={STATUS_OPTIONS} />
          </div>
        </div>

        {/* Address */}
        <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">Address</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Address Line 1" icon={MapPin} value={form.address_line1} onChange={set("address_line1")} />
            <Input label="Address Line 2" icon={MapPin} value={form.address_line2} onChange={set("address_line2")} />
            <Input label="City" icon={Map} value={form.city} onChange={set("city")} />
            <Input label="State" icon={Map} value={form.state} onChange={set("state")} />
            <Input label="Pincode" icon={Navigation} value={form.pincode} onChange={set("pincode")} />
            <Input label="Country" icon={Map} value={form.country} onChange={set("country")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate(`/tenants/${id}`)}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
