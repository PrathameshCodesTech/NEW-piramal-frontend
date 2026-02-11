import ScopePicker from "./ScopePicker";
import { useAuth } from "../../contexts/AuthContext";

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
