import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Link2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { membershipsAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import ScopeFilterDropdown from "../../../components/ui/ScopeFilterDropdown";

const SCOPE_BADGE_COLOR = { ORG: "blue", COMPANY: "purple", ENTITY: "amber", SITE: "emerald" };

export default function MembershipListPage() {
  const navigate = useNavigate();
  const basePath = useUserManagementBasePath();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [toggling, setToggling] = useState({});

  const fetchData = () => {
    setLoading(true);
    const params = {};
    if (scopeFilter) params.scope_id = scopeFilter;
    membershipsAPI.list(params)
      .then((res) => { setData(res?.results || res || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [scopeFilter]);

  const filtered = data.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.user_username || m.user_email || "").toLowerCase().includes(q) ||
      (m.scope_name || "").toLowerCase().includes(q) ||
      (m.role_name || "").toLowerCase().includes(q)
    );
  });

  const handleToggleActive = async (membership) => {
    setToggling((prev) => ({ ...prev, [membership.id]: true }));
    try {
      const updated = await membershipsAPI.update(membership.id, {
        is_active: !membership.is_active,
      });
      setData((prev) =>
        prev.map((m) => (m.id === membership.id ? { ...m, ...updated } : m))
      );
      toast.success(
        updated.is_active !== false ? "Membership activated" : "Membership deactivated"
      );
    } catch (err) {
      toast.error(err.message || "Failed to update membership");
    } finally {
      setToggling((prev) => ({ ...prev, [membership.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="border-l-2 border-emerald-500 pl-5 py-3 pr-5 mb-6 rounded-r-lg">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search memberships..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <ScopeFilterDropdown value={scopeFilter} onChange={setScopeFilter} className="w-52" />
          <Button icon={Plus} onClick={() => navigate(`${basePath}/memberships/create`)}>
            Assign Membership
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Link2}
          title={search ? "No memberships match" : "No memberships yet"}
          actionLabel={!search ? "Assign Membership" : undefined}
          onAction={!search ? () => navigate(`${basePath}/memberships/create`) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const isBusy = toggling[m.id];
            return (
              <div key={m.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Link2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <div>
                    <p className="text-xs text-gray-500">User</p>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {m.user_email || m.user_username || m.user || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Scope</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {m.scope_type && (
                        <Badge color={SCOPE_BADGE_COLOR[m.scope_type] || "gray"}>
                          {m.scope_type}
                        </Badge>
                      )}
                      <p className="text-sm text-gray-800 truncate">
                        {m.scope_name || m.scope || "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm text-gray-800 truncate">
                      {m.role_name || m.role_code || m.role || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge color={m.is_active ? "emerald" : "red"}>
                    {m.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(m)}
                    disabled={isBusy}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                      m.is_active ? "bg-emerald-500" : "bg-gray-300"
                    } ${isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    title={m.is_active ? "Deactivate" : "Activate"}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        m.is_active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
