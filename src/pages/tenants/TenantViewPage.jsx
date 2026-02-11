import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Pencil, Trash2, Plus, UserPlus, ShieldCheck, ShieldX, Phone, Mail,
  Building2, Tag, Globe, Briefcase, MapPin, Map, Navigation,
  User, Hash, Landmark,
} from "lucide-react";
import { tenantCompaniesAPI, tenantContactsAPI, tenantKycAPI } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const TABS = ["Details", "Contacts", "KYC"];

export default function TenantViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "", email: "", phone: "", mobile: "", designation: "", department: "", is_primary: false,
  });

  // KYC state
  const [kyc, setKyc] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [showKycForm, setShowKycForm] = useState(false);
  const [kycSaving, setKycSaving] = useState(false);
  const [kycForm, setKycForm] = useState({
    pan: "", gstin: "", cin: "", tan: "",
    bank_name: "", bank_account_number: "", bank_ifsc: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    tenantCompaniesAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const res = await tenantContactsAPI.list({ company_id: id });
      setContacts(res?.results || res || []);
    } catch { setContacts([]); }
    finally { setContactsLoading(false); }
  }, [id]);

  const fetchKyc = useCallback(async () => {
    setKycLoading(true);
    try {
      const res = await tenantKycAPI.list({ company_id: id });
      const list = res?.results || res || [];
      setKyc(list.length > 0 ? list[0] : null);
    } catch { setKyc(null); }
    finally { setKycLoading(false); }
  }, [id]);

  useEffect(() => {
    if (activeTab === 1) fetchContacts();
    if (activeTab === 2) fetchKyc();
  }, [activeTab, fetchContacts, fetchKyc]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tenantCompaniesAPI.delete(id);
      toast.success("Tenant deleted");
      navigate("/tenants");
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  // Contact handlers
  const cSet = (field) => (e) => setContactForm({ ...contactForm, [field]: field === "is_primary" ? e.target.checked : e.target.value });

  const handleAddContact = async (e) => {
    e.preventDefault();
    setContactSaving(true);
    try {
      await tenantContactsAPI.create({ ...contactForm, company: parseInt(id, 10) });
      toast.success("Contact added");
      setContactForm({ name: "", email: "", phone: "", mobile: "", designation: "", department: "", is_primary: false });
      setShowContactForm(false);
      await fetchContacts();
    } catch (err) { toast.error(err.message); }
    finally { setContactSaving(false); }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm("Delete this contact?")) return;
    try {
      await tenantContactsAPI.delete(contactId);
      toast.success("Contact deleted");
      await fetchContacts();
    } catch (err) { toast.error(err.message); }
  };

  // KYC handlers
  const kSet = (field) => (e) => setKycForm({ ...kycForm, [field]: e.target.value });

  const handleSaveKyc = async (e) => {
    e.preventDefault();
    setKycSaving(true);
    try {
      if (kyc) {
        await tenantKycAPI.update(kyc.id, kycForm);
        toast.success("KYC updated");
      } else {
        await tenantKycAPI.create({ ...kycForm, company: parseInt(id, 10) });
        toast.success("KYC created");
      }
      setShowKycForm(false);
      await fetchKyc();
    } catch (err) { toast.error(err.message); }
    finally { setKycSaving(false); }
  };

  const handleVerifyKyc = async () => {
    try {
      await tenantKycAPI.verify(kyc.id);
      toast.success("KYC verified");
      await fetchKyc();
    } catch (err) { toast.error(err.message); }
  };

  const handleRejectKyc = async () => {
    try {
      await tenantKycAPI.reject(kyc.id, rejectReason);
      toast.success("KYC rejected");
      setShowRejectDialog(false);
      setRejectReason("");
      await fetchKyc();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Tenant not found</div>;

  const statusColor = data.status === "ACTIVE" ? "emerald" : data.status === "SUSPENDED" ? "red" : "gray";

  return (
    <div>
      <PageHeader
        title={data.legal_name}
        subtitle={data.trade_name || "Tenant Company"}
        backTo="/tenants"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/tenants/${id}/edit`)}>Edit</Button>
            <Button variant="danger" icon={Trash2} onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === i
                ? "text-emerald-700 border-b-2 border-emerald-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge color={statusColor}>{data.status}</Badge>
            {data.industry && <Badge color="blue">{data.industry}</Badge>}
            {data.company_size && <Badge color="purple">{data.company_size}</Badge>}
          </div>

          {/* Company Info */}
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Company Information</h4>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              {[
                ["Legal Name", data.legal_name],
                ["Trade Name", data.trade_name],
                ["Email", data.email],
                ["Phone", data.phone],
                ["Website", data.website],
                ["Industry", data.industry],
                ["Company Size", data.company_size],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Address */}
          <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Address</h4>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              {[
                ["Address", [data.address_line1, data.address_line2].filter(Boolean).join(", ")],
                ["City", data.city],
                ["State", data.state],
                ["Pincode", data.pincode],
                ["Country", data.country],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 1 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Contacts ({contacts.length})
            </h3>
            <Button size="sm" icon={UserPlus} onClick={() => setShowContactForm(true)}>
              Add Contact
            </Button>
          </div>

          {contactsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 && !showContactForm ? (
            <div className="border-l-2 border-emerald-500 pl-5 py-8 pr-5 rounded-r-lg text-center text-sm text-gray-500">
              No contacts yet. Add your first contact.
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <Card key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      {c.is_primary && <Badge color="emerald">Primary</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[c.designation, c.department].filter(Boolean).join(" — ")}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                      {(c.phone || c.mobile) && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.mobile || c.phone}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}

          {showContactForm && (
            <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg mt-4">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-700">New Contact</h4>
              </div>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input label="Name" icon={User} value={contactForm.name} onChange={cSet("name")} required />
                  <Input label="Email" icon={Mail} type="email" value={contactForm.email} onChange={cSet("email")} />
                  <Input label="Phone" icon={Phone} value={contactForm.phone} onChange={cSet("phone")} />
                  <Input label="Mobile" icon={Phone} value={contactForm.mobile} onChange={cSet("mobile")} />
                  <Input label="Designation" icon={Briefcase} value={contactForm.designation} onChange={cSet("designation")} />
                  <Input label="Department" icon={Building2} value={contactForm.department} onChange={cSet("department")} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={contactForm.is_primary} onChange={cSet("is_primary")} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  Primary contact
                </label>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" type="button" size="sm" onClick={() => setShowContactForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm" icon={Plus} loading={contactSaving}>Add Contact</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === 2 && (
        <div>
          {kycLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !kyc && !showKycForm ? (
            <div className="border-l-2 border-emerald-500 pl-5 py-8 pr-5 rounded-r-lg text-center">
              <p className="text-sm text-gray-500 mb-4">No KYC information on file.</p>
              <Button size="sm" icon={Plus} onClick={() => setShowKycForm(true)}>Add KYC</Button>
            </div>
          ) : showKycForm ? (
            <form onSubmit={handleSaveKyc} className="space-y-6">
              {/* Tax Information */}
              <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    {kyc ? "Edit Tax Information" : "Tax Information"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input label="PAN" icon={Hash} value={kycForm.pan} onChange={kSet("pan")} />
                  <Input label="GSTIN" icon={Hash} value={kycForm.gstin} onChange={kSet("gstin")} />
                  <Input label="CIN" icon={Hash} value={kycForm.cin} onChange={kSet("cin")} />
                  <Input label="TAN" icon={Hash} value={kycForm.tan} onChange={kSet("tan")} />
                </div>
              </div>

              {/* Banking Details */}
              <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Banking Details</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input label="Bank Name" icon={Landmark} value={kycForm.bank_name} onChange={kSet("bank_name")} />
                  <Input label="Account Number" icon={Hash} value={kycForm.bank_account_number} onChange={kSet("bank_account_number")} />
                  <Input label="IFSC Code" icon={Hash} value={kycForm.bank_ifsc} onChange={kSet("bank_ifsc")} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" size="sm" onClick={() => setShowKycForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" loading={kycSaving}>{kyc ? "Update" : "Save"}</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* KYC Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700">KYC Status</h3>
                  <Badge color={
                    kyc.kyc_status === "VERIFIED" ? "emerald"
                      : kyc.kyc_status === "REJECTED" ? "red"
                      : kyc.kyc_status === "EXPIRED" ? "amber"
                      : "gray"
                  }>
                    {kyc.kyc_status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {kyc.kyc_status !== "VERIFIED" && (
                    <Button size="sm" icon={ShieldCheck} onClick={handleVerifyKyc}>Verify</Button>
                  )}
                  {kyc.kyc_status !== "REJECTED" && (
                    <Button size="sm" variant="danger" icon={ShieldX} onClick={() => setShowRejectDialog(true)}>Reject</Button>
                  )}
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={() => {
                    setKycForm({
                      pan: kyc.pan || "", gstin: kyc.gstin || "", cin: kyc.cin || "", tan: kyc.tan || "",
                      bank_name: kyc.bank_name || "", bank_account_number: kyc.bank_account_number || "",
                      bank_ifsc: kyc.bank_ifsc || "",
                    });
                    setShowKycForm(true);
                  }}>Edit</Button>
                </div>
              </div>

              {kyc.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  <strong>Rejection Reason:</strong> {kyc.rejection_reason}
                </div>
              )}

              {/* Tax Information Display */}
              <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Tax Information</h4>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                  {[
                    ["PAN", kyc.pan],
                    ["GSTIN", kyc.gstin],
                    ["CIN", kyc.cin],
                    ["TAN", kyc.tan],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium text-gray-500">{label}</dt>
                      <dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Banking Details Display */}
              <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Banking Details</h4>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                  {[
                    ["Bank Name", kyc.bank_name],
                    ["Account Number", kyc.bank_account_number],
                    ["IFSC Code", kyc.bank_ifsc],
                    ["Verified At", kyc.verified_at ? new Date(kyc.verified_at).toLocaleString() : null],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium text-gray-500">{label}</dt>
                      <dd className="text-sm text-gray-800 mt-0.5">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Tenant"
        message={`Are you sure you want to delete "${data.legal_name}"? This cannot be undone.`}
        loading={deleting}
      />

      {/* Reject KYC dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Reject KYC</h3>
            <Input
              label="Reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" size="sm" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleRejectKyc} disabled={!rejectReason.trim()}>Reject</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
