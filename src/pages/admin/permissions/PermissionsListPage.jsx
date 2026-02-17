import { useState, useEffect } from "react";
import { Search, Key } from "lucide-react";
import { permissionsAPI } from "../../../services/api";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

function groupPermissions(perms) {
  const groups = {};
  perms.forEach((p) => {
    const parts = p.code.split(".");
    const category = parts.length >= 2 ? parts[0] : "general";
    if (!groups[category]) groups[category] = [];
    groups[category].push(p);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function PermissionsListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    permissionsAPI.list()
      .then((res) => { setData(res?.results || res || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = data.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.code?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q);
  });

  const grouped = groupPermissions(filtered);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="border-l-2 border-emerald-500 pl-5 py-3 pr-5 mb-6 rounded-r-lg">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} permissions</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Key} title={search ? "No permissions match" : "No permissions found"} />
      ) : (
        <div className="space-y-4">
          {grouped.map(([category, perms]) => (
            <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                </span>
                <p className="text-sm font-semibold text-gray-800 capitalize">{category}</p>
                <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  {perms.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {perms.map((perm) => (
                  <div key={perm.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-gray-800">{perm.code}</p>
                      {perm.description && (
                        <p className="text-xs text-gray-500">{perm.description}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 shrink-0">{perm.name}</p>
                    <Badge color={perm.is_active !== false ? "emerald" : "red"}>
                      {perm.is_active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
