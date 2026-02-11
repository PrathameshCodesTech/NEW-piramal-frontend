import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, setActiveScopeId } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [availableScopes, setAvailableScopes] = useState([]);
  const [highestScopeLevel, setHighestScopeLevel] = useState(null);
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
      setUser(userData);
      setMemberships(me?.memberships || []);

      // Set default active scope
      if (me?.active_scope_id) {
        localStorage.setItem("activeScopeId", String(me.active_scope_id));
      } else if (me?.memberships?.length > 0) {
        const first = me.memberships[0];
        if (first?.scope_id) {
          setActiveScopeId(first.scope_id, first.scope_type, first.scope_name);
        }
      }

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
    setMemberships(membershipData || []);

    if (activeScopeIdVal) {
      localStorage.setItem("activeScopeId", String(activeScopeIdVal));
    } else if (membershipData?.length > 0) {
      const first = membershipData[0];
      if (first?.scope_id) {
        setActiveScopeId(first.scope_id, first.scope_type, first.scope_name);
      }
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setMemberships([]);
    setAvailableScopes([]);
    setHighestScopeLevel(null);
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
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth,
        refreshScopes,
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
