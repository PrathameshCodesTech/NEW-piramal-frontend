import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Search, Eye } from "lucide-react";
import { usersAPI } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import ScopeFilterDropdown from "../../../components/ui/ScopeFilterDropdown";

const SCOPE_BADGE_COLOR = { ORG: "blue", COMPANY: "purple", ENTITY: "amber", SITE: "emerald" };

export default function UserListPage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const { availableScopes } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (scopeFilter) {
      params.scope_id = scopeFilter;
      const matched = availableScopes.find((s) => String(s.id) === String(scopeFilter));
      if (matched) params.scope_type = matched.scope_type;
    }
    usersAPI
      .list(params)
      .then((res) => { setData(res?.results || res || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [scopeFilter]);

  const filtered = data.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    {
      key: "scopes",
      label: "Scopes",
      render: (row) => {
        if (!row.memberships || row.memberships.length === 0) {
          return <span className="text-gray-400 text-xs">No scope</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {row.memberships.map((m, i) => (
              <Badge key={i} color={SCOPE_BADGE_COLOR[m.scope_type] || "gray"}>
                {m.scope_name}
              </Badge>
            ))}
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
              {row.memberships.map((m, i) => (
                <span key={i} className="text-xs text-gray-600">{m.role_name}</span>
              ))}
            </div>
          );
        }
        return row.role ? <Badge color="blue">{row.role}</Badge> : <span className="text-gray-400">—</span>;
      },
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => <Badge color={row.is_active ? "emerald" : "red"}>{row.is_active ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "is_superuser",
      label: "Admin",
      render: (row) => row.is_superuser ? <Badge color="purple">Super Admin</Badge> : null,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/users/${row.id}`); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="border-l-2 border-emerald-500 pl-5 py-3 pr-5 mb-6 rounded-r-lg">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <ScopeFilterDropdown value={scopeFilter} onChange={setScopeFilter} className="w-52" />
          <Button icon={Plus} onClick={() => navigate(`${basePath}/users/create`)}>
            Create User
          </Button>
        </div>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No users match your search" : "No users yet"}
          actionLabel={!search ? "Create User" : undefined}
          onAction={!search ? () => navigate(`${basePath}/users/create`) : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => navigate(`${basePath}/users/${row.id}`)}
        />
      )}
    </div>
  );
}
