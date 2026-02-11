import { createContext, useContext, useState, useCallback } from "react";
import { getActiveScopeId, setActiveScopeId as persistScope } from "../services/api";

const ScopeContext = createContext(null);

export function ScopeProvider({ children }) {
  const [activeScopeId, setActiveScopeIdState] = useState(() => getActiveScopeId());

  const switchScope = useCallback((scopeId, scopeType, label) => {
    persistScope(scopeId, scopeType, label);
    setActiveScopeIdState(String(scopeId));
  }, []);

  return (
    <ScopeContext.Provider value={{ activeScopeId, switchScope }}>
      {children}
    </ScopeContext.Provider>
  );
}

export function useScope() {
  const ctx = useContext(ScopeContext);
  if (!ctx) throw new Error("useScope must be used within ScopeProvider");
  return ctx;
}
