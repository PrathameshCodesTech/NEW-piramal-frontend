import { FileText, Users, Building2, StickyNote, Hash, Briefcase } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import { AGREEMENT_TYPE_OPTIONS } from "../constants";

export default function BasicPartiesTab({
  form,
  setForm,
  tenantOptions,
  siteOptions,
  contactOptions,
  onSubmit,
  saving,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Agreement Details */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Agreement Details</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            label="Lease ID"
            icon={Hash}
            value={form.lease_id}
            onChange={(e) => setForm((p) => ({ ...p, lease_id: e.target.value }))}
            required
          />
          <Select
            label="Agreement Type"
            value={form.agreement_type}
            onChange={(e) => setForm((p) => ({ ...p, agreement_type: e.target.value }))}
            options={AGREEMENT_TYPE_OPTIONS}
          />
          <Input
            label="Reference Code"
            icon={Briefcase}
            value={form.ref_code}
            onChange={(e) => setForm((p) => ({ ...p, ref_code: e.target.value }))}
          />
          <Input
            label="Landlord Entity"
            icon={Building2}
            value={form.landlord_entity}
            onChange={(e) => setForm((p) => ({ ...p, landlord_entity: e.target.value }))}
          />
        </div>
      </div>

      {/* Parties */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Parties</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select
            label="Tenant"
            value={form.tenant}
            onChange={(e) => setForm((p) => ({ ...p, tenant: e.target.value, primary_contact: "" }))}
            options={tenantOptions}
          />
          <Select
            label="Primary Contact"
            value={form.primary_contact}
            onChange={(e) => setForm((p) => ({ ...p, primary_contact: e.target.value }))}
            options={contactOptions}
          />
          <Select
            label="Site"
            value={form.site}
            onChange={(e) => setForm((p) => ({ ...p, site: e.target.value }))}
            options={siteOptions}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Notes</h4>
        </div>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Add any additional notes about this agreement..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          Save Basic & Parties
        </Button>
      </div>
    </form>
  );
}
