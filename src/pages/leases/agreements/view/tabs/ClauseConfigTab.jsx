import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";

export default function ClauseConfigTab({
  loading,
  form,
  setForm,
  onSubmit,
  saving,
  clauseConfig,
}) {
  if (loading) {
    return (
      <Card className="p-6 max-w-3xl">
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-3xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Termination Clause Configuration</h3>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.tenant_early_exit_permitted}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                tenant_early_exit_permitted: e.target.checked,
              }))
            }
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Tenant early exit permitted
        </label>
        <Input
          label="Tenant Notice Days"
          type="number"
          value={form.tenant_notice_days}
          onChange={(e) => setForm((p) => ({ ...p, tenant_notice_days: e.target.value }))}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Termination Clause Text</label>
          <textarea
            rows={5}
            value={form.termination_clause}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                termination_clause: e.target.value,
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save Clause Config
          </Button>
        </div>
        {clauseConfig && (
          <p className="text-xs text-gray-500">
            Renewal: {clauseConfig.renewal_option ? "Configured" : "Not configured"} | Sublet/Signage:{" "}
            {clauseConfig.sublet_signage ? "Configured" : "Not configured"} | Exclusivity:{" "}
            {clauseConfig.exclusivity ? "Configured" : "Not configured"}
          </p>
        )}
      </form>
    </Card>
  );
}

