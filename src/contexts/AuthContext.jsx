import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, setActiveScopeId } from "../services/api";

const AuthContext = createContext(null);

// Derive module permissions for the currently active scope from memberships list
function deriveModulePermissions(membershipList, scopeId) {
  if (!scopeId || !membershipList?.length) return {};
  const m = membershipList.find((mb) => String(mb.scope_id) === String(scopeId));
  return m?.module_permissions || {};
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [availableScopes, setAvailableScopes] = useState([]);
  const [highestScopeLevel, setHighestScopeLevel] = useState(null);
  const [activeModulePermissions, setActiveModulePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!authAPI.isAuthenticated()) {
        setIsAuthenticated(false);
        return;
      }

      const me = await authAPI.getMe();
      const userData = me?.user || null;
      const membershipList = me?.memberships || [];
      setUser(userData);
      setMemberships(membershipList);

      // Set default active scope
      let resolvedScopeId = me?.active_scope_id
        ? String(me.active_scope_id)
        : localStorage.getItem("activeScopeId");

      if (me?.active_scope_id) {
        localStorage.setItem("activeScopeId", String(me.active_scope_id));
      } else if (membershipList.length > 0 && !resolvedScopeId) {
        const first = membershipList[0];
        if (first?.scope_id) {
          resolvedScopeId = String(first.scope_id);
          setActiveScopeId(first.scope_id, first.scope_type, first.scope_name);
        }
      }

      // Derive module permissions for active scope
      setActiveModulePermissions(deriveModulePermissions(membershipList, resolvedScopeId));

      // Fetch available scopes
      try {
        const scopesResp = await authAPI.getAvailableScopes();
        setAvailableScopes(scopesResp?.scopes || []);
        setHighestScopeLevel(scopesResp?.highest_level || null);
      } catch {
        setAvailableScopes([]);
      }

      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, membershipData = null, activeScopeIdVal = null) => {
    setUser(userData);
    const mList = membershipData || [];
    setMemberships(mList);

    let resolvedScopeId = activeScopeIdVal;
    if (activeScopeIdVal) {
      localStorage.setItem("activeScopeId", String(activeScopeIdVal));
    } else if (mList.length > 0) {
      const first = mList[0];
      if (first?.scope_id) {
        resolvedScopeId = String(first.scope_id);
        setActiveScopeId(first.scope_id, first.scope_type, first.scope_name);
      }
    }
    setActiveModulePermissions(deriveModulePermissions(mList, resolvedScopeId));
    setIsAuthenticated(true);
  };

  // Call this when user switches active scope (e.g. from scope picker)
  const switchScope = (scopeId, scopeType, label) => {
    setActiveScopeId(scopeId, scopeType, label);
    setActiveModulePermissions(deriveModulePermissions(memberships, scopeId));
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setMemberships([]);
    setAvailableScopes([]);
    setHighestScopeLevel(null);
    setActiveModulePermissions({});
    setIsAuthenticated(false);
  };

  const refreshScopes = async () => {
    try {
      const resp = await authAPI.getAvailableScopes();
      setAvailableScopes(resp?.scopes || []);
      setHighestScopeLevel(resp?.highest_level || null);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        availableScopes,
        highestScopeLevel,
        activeModulePermissions,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth,
        refreshScopes,
        switchScope,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
