import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_CONFIG } from "../config/apiConfig";
import { authApi } from "../services/authApi";
import {
  clearTokens,
  getStoredTokens,
  saveTokens,
} from "../services/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const applyAuthResult = useCallback(async (result) => {
    const nextSession = {
      accessToken: result?.accessToken ?? null,
      refreshToken: result?.refreshToken ?? null,
    };

    if (nextSession.accessToken || nextSession.refreshToken) {
      await saveTokens(nextSession);
      setSession(nextSession);
    }

    if (result?.user) setUser(result.user);
    return result;
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      if (!API_CONFIG.baseURL) return;

      const stored = await getStoredTokens();
      if (stored.accessToken || stored.refreshToken) {
        setSession(stored);
      }

      // /auth/me también permite restaurar una sesión basada en cookie en web.
      if (stored.accessToken || typeof window !== "undefined") {
        try {
          const currentUser = await authApi.me();
          if (currentUser) setUser(currentUser);
        } catch {
          if (stored.accessToken) {
            await clearTokens();
            setSession(null);
          }
        }
      }
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (values) => applyAuthResult(await authApi.login(values)),
    [applyAuthResult]
  );

  const register = useCallback(
    async (values) => applyAuthResult(await authApi.register(values)),
    [applyAuthResult]
  );

  const verify = useCallback(
    async (values) => applyAuthResult(await authApi.verify(values)),
    [applyAuthResult]
  );

  const resendVerification = useCallback(
    (values) => authApi.resendVerification(values),
    []
  );

  const forgotPassword = useCallback(
    (email) => authApi.forgotPassword(email),
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    await clearTokens();
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      initializing,
      isAuthenticated: Boolean(user || session?.accessToken),
      login,
      register,
      verify,
      resendVerification,
      forgotPassword,
      logout,
      restoreSession,
    }),
    [
      user,
      session,
      initializing,
      login,
      register,
      verify,
      resendVerification,
      forgotPassword,
      logout,
      restoreSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}
