import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Users, Search, Eye, ChevronDown,
  UserPlus, UserCheck, UserX, RefreshCw, X, Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import { usersAPI, rolesAPI } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import ScopeFilterDropdown from "../../../components/ui/ScopeFilterDropdown";

const SCOPE_BADGE_COLOR = { ORG: "blue", COMPANY: "purple", ENTITY: "amber", SITE: "emerald" };
const STATUS_COLOR = { ACTIVE: "emerald", INACTIVE: "red", PENDING: "amber", SUSPENDED: "purple" };

// ── Invite User Modal ────────────────────────────────────────────────────────

function InviteUserModal({ roles, onClose, onInvited }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.inviteUser(form);
      toast.success(`Invitation sent to ${form.email}`);
      onInvited();
    } catch (err) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Invite User</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={set("first_name")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={set("last_name")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={set("email")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Initial Role (optional)</label>
            <select
              value={form.role}
              onChange={set("role")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="">No role assigned</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <Button type="submit" loading={loading} icon={Mail}>Send Invite</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Bulk Actions Dropdown ─────────────────────────────────────────────────────

function BulkActionsDropdown({ selected, roles, onDone }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (selected.length === 0) return null;

  const run = async (action, extra = {}) => {
    setOpen(false);
    setLoading(true);
    try {
      await usersAPI.bulkAction({ user_ids: selected, action, ...extra });
      toast.success(`Bulk action applied to ${selected.length} user(s)`);
      onDone();
    } catch (err) {
      toast.error(err.message || "Bulk action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setOpen((p) => !p)}
        loading={loading}
        icon={ChevronDown}
      >
        {selected.length} selected
      </Button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          <button
            type="button"
            onClick={() => run("activate")}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            <UserCheck className="w-4 h-4" /> Activate users
          </button>
          <button
            type="button"
            onClick={() => run("deactivate")}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <UserX className="w-4 h-4" /> Deactivate users
          </button>
          {roles.length > 0 && (
            <div className="border-t border-gray-100">
              <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Change role to</p>
              <div className="max-h-40 overflow-y-auto">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => run("change_role", { role_id: r.id })}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UserListPage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const { availableScopes } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [roles, setRoles] = useState([]);

  const loadUsers = () => {
    setLoading(true);
    const params = {};
    if (scopeFilter) {
      params.scope_id = scopeFilter;
      const matched = availableScopes.find((s) => String(s.id) === String(scopeFilter));
      if (matched) params.scope_type = matched.scope_type;
    }
    if (statusFilter) params.status = statusFilter;
    if (roleFilter) params.role = roleFilter;
    if (departmentFilter) params.department = departmentFilter;

    usersAPI
      .list(params)
      .then((res) => { setData(res?.results || res || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [scopeFilter, statusFilter, roleFilter, departmentFilter]);

  useEffect(() => {
    rolesAPI.list().then((res) => setRoles(res?.results || res || [])).catch(() => {});
  }, []);

  const filtered = data.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id) => {
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((u) => u.id));
  };

  const columns = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={filtered.length > 0 && selected.length === filtered.length}
          onChange={toggleSelectAll}
          className="rounded text-emerald-600 focus:ring-emerald-500"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.includes(row.id)}
          onChange={() => toggleSelect(row.id)}
          onClick={(e) => e.stopPropagation()}
          className="rounded text-emerald-600 focus:ring-emerald-500"
        />
      ),
    },
    {
      key: "name",
      label: "Name / Email",
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-800">
            {row.first_name || row.last_name
              ? `${row.first_name || ""} ${row.last_name || ""}`.trim()
              : row.username}
          </p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (row) => (
        <span className="text-xs text-gray-600">{row.department || "—"}</span>
      ),
    },
    {
      key: "scopes",
      label: "Scopes",
      render: (row) => {
        if (!row.memberships || row.memberships.length === 0) {
          return <span className="text-gray-400 text-xs">No scope</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {row.memberships.slice(0, 2).map((m, i) => (
              <Badge key={i} color={SCOPE_BADGE_COLOR[m.scope_type] || "gray"}>
                {m.scope_name}
              </Badge>
            ))}
            {row.memberships.length > 2 && (
              <span className="text-xs text-gray-400">+{row.memberships.length - 2}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Role",
      render: (row) => {
        if (row.memberships?.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {row.memberships.slice(0, 2).map((m, i) => (
                <span key={i} className="text-xs text-gray-600">{m.role_name}</span>
              ))}
            </div>
          );
        }
        return <span className="text-gray-400 text-xs">—</span>;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const userStatus = row.user_status || (row.is_active ? "ACTIVE" : "INACTIVE");
        return <Badge color={STATUS_COLOR[userStatus] || "gray"}>{userStatus}</Badge>;
      },
    },
    {
      key: "is_superuser",
      label: "Admin",
      render: (row) => row.is_superuser ? <Badge color="purple">Super Admin</Badge> : null,
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/users/${row.id}`); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const hasFilters = statusFilter || roleFilter || departmentFilter || scopeFilter;

  return (
    <div>
      {/* Filter bar */}
      <div className="border-l-2 border-emerald-500 pl-5 py-3 pr-5 mb-4 rounded-r-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <ScopeFilterDropdown value={scopeFilter} onChange={setScopeFilter} className="w-44" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Department..."
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 w-36"
          />

          {hasFilters && (
            <button
              type="button"
              onClick={() => { setStatusFilter(""); setRoleFilter(""); setDepartmentFilter(""); setScopeFilter(""); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-3 h-3" /> Clear
            </button>
          )}

          <div className="flex-1" />

          <BulkActionsDropdown selected={selected} roles={roles} onDone={() => { setSelected([]); loadUsers(); }} />

          <Button variant="secondary" icon={UserPlus} onClick={() => setShowInvite(true)}>
            Invite
          </Button>
          <Button icon={Plus} onClick={() => navigate(`${basePath}/users/create`)}>
            Create User
          </Button>
        </div>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search || hasFilters ? "No users match your filters" : "No users yet"}
          actionLabel={!search && !hasFilters ? "Create User" : undefined}
          onAction={!search && !hasFilters ? () => navigate(`${basePath}/users/create`) : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => navigate(`${basePath}/users/${row.id}`)}
        />
      )}

      {showInvite && (
        <InviteUserModal
          roles={roles}
          onClose={() => setShowInvite(false)}
          onInvited={() => { setShowInvite(false); loadUsers(); }}
        />
      )}
    </div>
  );
}
