import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ShieldCheck, Search, Eye, ChevronDown, ChevronRight, Key } from "lucide-react";
import { rolesAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

export default function RoleListPage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    rolesAPI.list().then((res) => { setData(res?.results || res || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = data.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.code?.toLowerCase().includes(q) ||
      r.scope_name?.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

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
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <Button icon={Plus} onClick={() => navigate(`${basePath}/roles/create`)}>
            Create Role
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={search ? "No roles match your search" : "No roles yet"}
          actionLabel={!search ? "Create Role" : undefined}
          onAction={!search ? () => navigate(`${basePath}/roles/create`) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((role) => {
            const isExpanded = expandedId === role.id;
            const perms = role.permissions_list || [];
            return (
              <div key={role.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Role row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(role.id)}
                >
                  <button type="button" className="text-gray-400 shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{role.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {role.scope_name || role.scope || "—"} &middot; <span className="font-mono">{role.code}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {role.is_system && <Badge color="purple">System</Badge>}
                    <Badge color={role.is_active !== false ? "emerald" : "red"}>
                      {role.is_active !== false ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      {perms.length} permission{perms.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/roles/${role.id}`); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="View & Edit Permissions"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded permissions */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                    {perms.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No permissions assigned to this role.</p>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Permissions</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {perms.map((code) => (
                            <span key={code} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {code}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`${basePath}/roles/${role.id}`)}
                          className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Manage permissions →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
