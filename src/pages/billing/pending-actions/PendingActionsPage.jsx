import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { pendingActionsAPI } from "../../../services/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";

const STATUS_TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPLIED", label: "Applied" },
  { key: "DISMISSED", label: "Dismissed" },
];

const RULE_TYPE_COLOR = {
  BILLING: "bg-emerald-100 text-emerald-700",
  CREDIT: "bg-blue-100 text-blue-700",
  DISPUTE: "bg-red-100 text-red-700",
};

const OBJECT_TYPE_LABEL = {
  INVOICE: "Invoice",
  CREDIT_NOTE: "Credit Note",
  DISPUTE: "Dispute",
};

function ActionCard({ action, onApply, onDismiss, loading }) {
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${RULE_TYPE_COLOR[action.rule_type] || "bg-gray-100 text-gray-600"}`}>
            {action.rule_type}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{action.action_description}</p>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
            {action.rule_name && <span>Rule: <strong>{action.rule_name}</strong></span>}
            <span>
              {OBJECT_TYPE_LABEL[action.object_type] || action.object_type} #{action.object_id}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(action.triggered_at).toLocaleString()}
            </span>
          </div>
          {action.status === "APPLIED" && action.applied_by_name && (
            <p className="text-xs text-emerald-600 mt-1">
              Applied by {action.applied_by_name} on {new Date(action.applied_at).toLocaleString()}
              {action.note && ` — "${action.note}"`}
            </p>
          )}
          {action.status === "DISMISSED" && (
            <p className="text-xs text-gray-400 mt-1">
              Dismissed{action.note ? ` — "${action.note}"` : ""}
            </p>
          )}

          {action.status === "PENDING" && (
            <div className="mt-3">
              {expanded ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note (reason for applying / dismissing)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onApply(action.id, note)} loading={loading === `apply-${action.id}`}>
                      Apply
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onDismiss(action.id, note)} loading={loading === `dismiss-${action.id}`}>
                      Dismiss
                    </Button>
                    <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setExpanded(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setExpanded(true)}>
                    Apply
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => { setExpanded(true); }}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function PendingActionsPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [actions, setActions] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(() => {
    setLoadingList(true);
    pendingActionsAPI
      .list({ status: activeTab })
      .then((res) => setActions(res?.results || res || []))
      .catch(() => setActions([]))
      .finally(() => setLoadingList(false));
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const handleApply = async (id, note) => {
    setActionLoading(`apply-${id}`);
    try {
      await pendingActionsAPI.apply(id, note);
      toast.success("Action applied");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to apply");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (id, note) => {
    setActionLoading(`dismiss-${id}`);
    try {
      await pendingActionsAPI.dismiss(id, note);
      toast.success("Action dismissed");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to dismiss");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = activeTab === "PENDING" ? actions.length : null;

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-5">
        <h2 className="text-base font-semibold text-gray-800">Pending Actions</h2>
        {pendingCount != null && pendingCount > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        )}
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "text-emerald-700 border-emerald-500"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadingList ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : actions.length === 0 ? (
        <EmptyState
          icon={activeTab === "PENDING" ? Bell : activeTab === "APPLIED" ? CheckCircle : XCircle}
          title={activeTab === "PENDING" ? "No pending actions" : activeTab === "APPLIED" ? "No applied actions" : "No dismissed actions"}
          description={
            activeTab === "PENDING"
              ? "When a billing, credit, or dispute rule is triggered in Manual mode, actions will appear here for you to review."
              : `Actions you have ${activeTab.toLowerCase()} will appear here.`
          }
        />
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onApply={handleApply}
              onDismiss={handleDismiss}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
