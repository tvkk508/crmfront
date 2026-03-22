import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "../api/types";
import { fetchMe, login as apiLogin, logout as apiLogout } from "../api/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./storage";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (loginValue: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const result = await fetchMe();
        setUser(result.user);
      } catch {
        clearAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthToken();
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (loginValue: string, password: string) => {
    const result = await apiLogin(loginValue, password);
    setAuthToken(result.token);
    setUser(result.user);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
