import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Key, Info, Loader2 } from "lucide-react";
import { rolesAPI, permissionsAPI, rolePermissionsAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Badge from "../../../components/ui/Badge";

function groupPermissions(allPerms) {
  const groups = {};
  allPerms.forEach((p) => {
    const parts = p.code.split(".");
    const category = parts.length >= 2 ? parts[0] : "general";
    if (!groups[category]) groups[category] = [];
    groups[category].push(p);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function RoleViewPage() {
  const { id } = useParams();
  const basePath = useUserManagementBasePath();
  const [role, setRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePerms, setRolePerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});

  const fetchAll = useCallback(async () => {
    try {
      const [roleData, permsData, rpData] = await Promise.all([
        rolesAPI.get(id),
        permissionsAPI.list(),
        rolePermissionsAPI.list({ role_id: id }),
      ]);
      setRole(roleData);
      setAllPermissions(permsData?.results || permsData || []);
      setRolePerms(rpData?.results || rpData || []);
    } catch {
      toast.error("Failed to load role details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const assignedPermIds = new Set(rolePerms.map((rp) => rp.permission || rp.permission_id));

  const handleToggle = async (permission) => {
    const permId = permission.id;
    const isAssigned = assignedPermIds.has(permId);
    const key = `${permId}`;
    setToggling((prev) => ({ ...prev, [key]: true }));

    try {
      if (isAssigned) {
        const rp = rolePerms.find(
          (r) => (r.permission || r.permission_id) === permId
        );
        if (rp) {
          await rolePermissionsAPI.delete(rp.id);
          setRolePerms((prev) => prev.filter((r) => r.id !== rp.id));
          toast.success(`Removed: ${permission.code}`);
        }
      } else {
        const created = await rolePermissionsAPI.create({
          role: Number(id),
          permission: permId,
        });
        setRolePerms((prev) => [...prev, created]);
        toast.success(`Added: ${permission.code}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update permission");
    } finally {
      setToggling((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!role) return <div className="text-center py-12 text-gray-500">Role not found</div>;

  const grouped = groupPermissions(allPermissions);
  const assignedCount = assignedPermIds.size;
  const totalCount = allPermissions.length;

  return (
    <div>
      <PageHeader title={role.name} subtitle="Manage Role Permissions" backTo={`${basePath}/roles`} />

      {/* Role Info */}
      <div className="border-l-2 border-emerald-500 pl-5 py-5 pr-5 mb-6 rounded-r-lg">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Role Details</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Name</p>
            <p className="text-sm font-medium text-gray-800">{role.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Code</p>
            <p className="text-sm font-mono text-gray-800">{role.code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Scope</p>
            <p className="text-sm text-gray-800">{role.scope_name || "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            {role.is_system && <Badge color="purple">System</Badge>}
            <Badge color={role.is_active !== false ? "emerald" : "red"}>
              {role.is_active !== false ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Permission summary bar */}
      <div className="flex items-center gap-3 mb-6 bg-white border border-gray-200 rounded-xl px-5 py-3">
        <Key className="w-4 h-4 text-amber-600" />
        <p className="text-sm text-gray-700 font-medium">
          {assignedCount} of {totalCount} permissions assigned
        </p>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: totalCount > 0 ? `${(assignedCount / totalCount) * 100}%` : "0%" }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0}%
        </span>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Toggle switches to grant or revoke permissions for this role. Changes take effect immediately.
        </p>
      </div>

      {/* Permission groups */}
      <div className="space-y-4">
        {grouped.map(([category, perms]) => {
          const catAssigned = perms.filter((p) => assignedPermIds.has(p.id)).length;
          return (
            <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                </span>
                <p className="text-sm font-semibold text-gray-800 capitalize">{category}</p>
                <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  {catAssigned}/{perms.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {perms.map((perm) => {
                  const isOn = assignedPermIds.has(perm.id);
                  const isBusy = toggling[`${perm.id}`];
                  return (
                    <div
                      key={perm.id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-mono">{perm.code}</p>
                        {perm.name && perm.name !== perm.code && (
                          <p className="text-xs text-gray-500">{perm.name}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle(perm)}
                        disabled={isBusy}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                          isOn ? "bg-emerald-500" : "bg-gray-300"
                        } ${isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {isBusy ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-3 h-3 text-white animate-spin" />
                          </span>
                        ) : (
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              isOn ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
