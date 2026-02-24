import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import ScopePicker from "./ScopePicker";
import { useAuth } from "../../contexts/AuthContext";
import { pendingActionsAPI } from "../../services/api";

function PendingBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      pendingActionsAPI.count()
        .then((res) => { if (!cancelled) setCount(res?.pending_count || 0); })
        .catch(() => {});
    };

    poll();
    const id = setInterval(poll, 60_000); // refresh every 60 s
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <Link to="/billing/pending-actions" className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
      <Bell className="w-5 h-5 text-gray-500" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export default function Topbar() {
  const { user } = useAuth();
  const isAdmin = user?.is_superuser === true;

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-gray-500">
        {isAdmin ? "Platform Admin" : "Tenant Portal"}
      </div>
      <div className="flex items-center gap-4">
        {!isAdmin && <ScopePicker />}
        {!isAdmin && <PendingBell />}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-emerald-700">
              {(user?.username || "U")[0].toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.username || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
