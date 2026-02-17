import { useAuth } from "../../contexts/AuthContext";

const INDENT = { ORG: "", COMPANY: "\u00A0\u00A0\u00A0\u00A0", ENTITY: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0", SITE: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" };

export default function ScopeFilterDropdown({ value, onChange, label, showAll = true, className = "" }) {
  const { availableScopes } = useAuth();

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg outline-none transition-colors px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        {showAll && <option value="">All Scopes</option>}
        {!showAll && !value && <option value="">Select scope...</option>}
        {availableScopes.map((s) => (
          <option key={s.id} value={s.id}>
            {INDENT[s.scope_type] || ""}{s.name} ({s.scope_type})
          </option>
        ))}
      </select>
    </div>
  );
}
