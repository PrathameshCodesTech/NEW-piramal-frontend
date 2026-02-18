import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, ShieldCheck, Search, Eye, ChevronDown, ChevronRight,
  Key, Copy, Zap, CheckCircle2, Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { rolesAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";

const ROLE_TYPE_COLOR = {
  ADMIN: "purple",
  BUSINESS: "blue",
  TENANT: "amber",
  READONLY: "gray",
};

const STATUS_COLOR = {
  PUBLISHED: "emerald",
  DRAFT: "amber",
};

export default function RoleListPage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [actioning, setActioning] = useState(null);

  const loadRoles = () => {
    setLoading(true);
    rolesAPI.list()
      .then((res) => { setData(res?.results || res || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRoles(); }, []);

  const filtered = data.filter((r) => {
    if (typeFilter && r.role_type !== typeFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.code?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePublish = async (id) => {
    setActioning(id);
    try {
      await rolesAPI.publish(id);
      toast.success("Role published");
      loadRoles();
    } catch (err) {
      toast.error(err.message || "Publish failed");
    } finally {
      setActioning(null);
    }
  };

  const handleDuplicate = async (id) => {
    setActioning(id);
    try {
      await rolesAPI.duplicate(id);
      toast.success("Role duplicated as draft");
      loadRoles();
    } catch (err) {
      toast.error(err.message || "Duplicate failed");
    } finally {
      setActioning(null);
    }
  };

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
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Types</option>
            <option value="ADMIN">Admin</option>
            <option value="BUSINESS">Business</option>
            <option value="TENANT">Tenant</option>
            <option value="READONLY">Read Only</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
          <Button icon={Plus} onClick={() => navigate(`${basePath}/roles/create`)}>
            Create Role
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={search || typeFilter || statusFilter ? "No roles match your filters" : "No roles yet"}
          actionLabel={!search && !typeFilter && !statusFilter ? "Create Role" : undefined}
          onAction={!search && !typeFilter && !statusFilter ? () => navigate(`${basePath}/roles/create`) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((role) => {
            const isExpanded = expandedId === role.id;
            const perms = role.permissions_list || [];
            const modulePerm = role.module_permissions || [];

            return (
              <div key={role.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Role row */}
                <div
                  className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
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
                      {role.scope_name || role.scope || "—"}
                      {role.code && <span className="font-mono ml-2 text-gray-400">· {role.code}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {role.role_type && (
                      <Badge color={ROLE_TYPE_COLOR[role.role_type] || "gray"}>
                        {role.role_type}
                      </Badge>
                    )}
                    <Badge color={STATUS_COLOR[role.status] || (role.is_active !== false ? "emerald" : "red")}>
                      {role.status || (role.is_active !== false ? "Active" : "Inactive")}
                    </Badge>
                    {role.is_system && <Badge color="purple">System</Badge>}
                    <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      {modulePerm.length || perms.length} perms
                    </span>

                    <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                      {role.status === "DRAFT" && (
                        <button
                          type="button"
                          onClick={() => handlePublish(role.id)}
                          disabled={actioning === role.id}
                          title="Publish"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(role.id)}
                        disabled={actioning === role.id}
                        title="Duplicate"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {actioning === role.id ? (
                          <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
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
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-4">
                    {role.description && (
                      <p className="text-sm text-gray-600 italic">{role.description}</p>
                    )}

                    {(role.approval_cap_amount || role.can_approve_amendments || role.can_approve_waivers) && (
                      <div className="flex flex-wrap gap-2">
                        {role.approval_cap_amount && (
                          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg">
                            <Zap className="w-3 h-3" />
                            Cap: ₹{Number(role.approval_cap_amount).toLocaleString("en-IN")}
                          </span>
                        )}
                        {role.can_approve_amendments && (
                          <span className="text-xs px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg">Amendments</span>
                        )}
                        {role.can_approve_waivers && (
                          <span className="text-xs px-2.5 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg">Waivers</span>
                        )}
                      </div>
                    )}

                    {modulePerm.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Module Permissions</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {modulePerm.map((mp) => {
                            const enabled = ["can_view", "can_create", "can_edit", "can_delete", "can_approve"]
                              .filter((k) => mp[k])
                              .map((k) => k.replace("can_", ""));
                            if (enabled.length === 0) return null;
                            return (
                              <div key={mp.module} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5">
                                <span className="text-xs font-medium text-gray-700 w-24">{mp.module}</span>
                                <div className="flex flex-wrap gap-1">
                                  {enabled.map((e) => (
                                    <span key={e} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">{e}</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : perms.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
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
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No permissions assigned to this role.</p>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`${basePath}/roles/${role.id}`)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Manage permissions →
                    </button>
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
