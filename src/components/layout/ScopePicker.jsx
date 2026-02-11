import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Building2, Layers, MapPin } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useScope } from "../../contexts/ScopeContext";

const scopeIcons = {
  ORG: Building2,
  COMPANY: Layers,
  ENTITY: MapPin,
  SITE: MapPin,
};

export default function ScopePicker() {
  const { availableScopes } = useAuth();
  const { activeScopeId, switchScope } = useScope();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeScope = availableScopes.find((s) => String(s.id) === String(activeScopeId));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
      >
        <Building2 className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700 font-medium max-w-[160px] truncate">
          {activeScope?.name || "Select Scope"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1 max-h-72 overflow-y-auto">
          {availableScopes.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">No scopes available</p>
          ) : (
            availableScopes.map((scope) => {
              const Icon = scopeIcons[scope.scope_type] || Building2;
              const isActive = String(scope.id) === String(activeScopeId);
              return (
                <button
                  key={scope.id}
                  onClick={() => {
                    switchScope(scope.id, scope.scope_type, scope.name);
                    setOpen(false);
                    window.location.reload();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors cursor-pointer ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">{scope.name}</p>
                    <p className="text-xs text-gray-400">{scope.scope_type}</p>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
