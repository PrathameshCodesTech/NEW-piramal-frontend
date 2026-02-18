import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Link2, UserCheck, UserX, KeyRound, XCircle,
  Clock, Shield, User, Building2, ChevronDown, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { usersAPI } from "../../../services/api";
import { useUserManagementBasePath } from "../../../contexts/UserManagementContext";
import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

const SCOPE_BADGE_COLOR = { ORG: "blue", COMPANY: "purple", ENTITY: "amber", SITE: "emerald" };
const STATUS_COLOR = { ACTIVE: "emerald", INACTIVE: "red", PENDING: "amber", SUSPENDED: "purple" };

// ── Change Log Section ────────────────────────────────────────────────────────

function ChangeLogSection({ userId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (logs.length > 0) { setOpen((p) => !p); return; }
    setLoading(true);
    try {
      const res = await usersAPI.changeLog(userId);
      setLogs(res?.results || res || []);
      setOpen(true);
    } catch {
      toast.error("Failed to load change log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={load}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 w-full"
      >
        <Clock className="w-4 h-4 text-gray-500" />
        Change History
        {loading && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin ml-1" />}
        <span className="ml-auto">
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {logs.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No changes recorded yet.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-xs bg-gray-50 rounded-lg px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700">
                    <span className="font-medium">{log.field_changed}</span> changed
                    {log.old_value && ` from "${log.old_value}"`} to{" "}
                    <span className="font-medium">"{log.new_value}"</span>
                  </p>
                  <p className="text-gray-400 mt-0.5">
                    by {log.changed_by_name || "System"} · {new Date(log.changed_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Status Action Buttons ─────────────────────────────────────────────────────

function StatusActions({ user, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const status = user.user_status || (user.is_active ? "ACTIVE" : "INACTIVE");

  const runAction = async (action) => {
    setLoading(true);
    try {
      if (action === "reset_password") {
        const res = await usersAPI.resetPassword(user.id);
        toast.success(`Temporary password: ${res.new_password || "Sent via email"}`);
      } else if (action === "revoke") {
        await usersAPI.revokeInvitation(user.id);
        toast.success("Invitation revoked");
        onRefresh();
      } else {
        await usersAPI.setStatus(user.id, action);
        toast.success(`User ${action.toLowerCase()}d`);
        onRefresh();
      }
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "ACTIVE" && (
        <Button
          size="sm"
          variant="secondary"
          icon={UserCheck}
          loading={loading}
          onClick={() => runAction("ACTIVE")}
        >
          Activate
        </Button>
      )}
      {status === "ACTIVE" && (
        <Button
          size="sm"
          variant="secondary"
          icon={UserX}
          loading={loading}
          onClick={() => runAction("INACTIVE")}
        >
          Deactivate
        </Button>
      )}
      {status !== "SUSPENDED" && status !== "PENDING" && (
        <Button
          size="sm"
          variant="secondary"
          loading={loading}
          onClick={() => runAction("SUSPENDED")}
          className="text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          Suspend
        </Button>
      )}
      <Button
        size="sm"
        variant="secondary"
        icon={KeyRound}
        loading={loading}
        onClick={() => runAction("reset_password")}
      >
        Reset Password
      </Button>
      {status === "PENDING" && (
        <Button
          size="sm"
          variant="secondary"
          icon={XCircle}
          loading={loading}
          onClick={() => runAction("revoke")}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Revoke Invitation
        </Button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UserViewPage() {
  const { id } = useParams();
  const basePath = useUserManagementBasePath();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    usersAPI.get(id).then((res) => { setData(res); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="text-center py-12 text-gray-500">User not found</div>;

  const userStatus = data.user_status || (data.is_active ? "ACTIVE" : "INACTIVE");
  const profile = data.profile || {};
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username;

  return (
    <div>
      <PageHeader title={fullName} subtitle="User Details" backTo={`${basePath}/users`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile card */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            {/* Status + badges */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex flex-wrap gap-2">
                <Badge color={STATUS_COLOR[userStatus] || "gray"}>{userStatus}</Badge>
                {data.is_superuser && <Badge color="purple">Super Admin</Badge>}
              </div>
              <StatusActions user={data} onRefresh={load} />
            </div>

            {/* Core fields */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700 shrink-0">
                {(data.first_name?.[0] || data.username?.[0] || "U").toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{fullName}</p>
                <p className="text-sm text-gray-500">{data.email}</p>
                <p className="text-xs text-gray-400 font-mono">@{data.username}</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {[
                ["Department", profile.department || data.department || "—", Building2],
                ["Phone", profile.phone || "—", User],
                ["Last Login", data.last_login ? new Date(data.last_login).toLocaleString("en-IN") : "Never", Clock],
                ["Invite Accepted", profile.invite_accepted ? "Yes" : userStatus === "PENDING" ? "Pending" : "N/A", Shield],
              ].map(([label, value, Icon]) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">{label}</dt>
                    <dd className="text-sm text-gray-800 mt-0.5">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {/* Change log */}
            <ChangeLogSection userId={id} />
          </Card>
        </div>

        {/* Right — Memberships card */}
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-700">Scope Memberships</h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {data.memberships?.length || 0}
              </span>
            </div>
            {!data.memberships || data.memberships.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No scope memberships assigned.</p>
            ) : (
              <div className="space-y-2">
                {data.memberships.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                    <Badge color={SCOPE_BADGE_COLOR[m.scope_type] || "gray"} className="shrink-0 mt-0.5">
                      {m.scope_type}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{m.scope_name}</p>
                      <p className="text-xs text-gray-500">{m.role_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent changes summary if available */}
          {data.recent_changes?.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-700">Recent Changes</h3>
              </div>
              <div className="space-y-2">
                {data.recent_changes.slice(0, 5).map((log, i) => (
                  <div key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-medium">{log.field_changed}</span>
                      {" → "}{log.new_value}
                      <span className="text-gray-400 block mt-0.5">
                        {new Date(log.changed_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
