import Card from "../../../../../components/ui/Card";
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
    <Card className="p-6 max-w-4xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Lease ID"
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
          <Input
            label="Landlord Entity"
            value={form.landlord_entity}
            onChange={(e) => setForm((p) => ({ ...p, landlord_entity: e.target.value }))}
          />
          <Input
            label="Reference Code"
            value={form.ref_code}
            onChange={(e) => setForm((p) => ({ ...p, ref_code: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save Basic & Parties
          </Button>
        </div>
      </form>
    </Card>
  );
}

