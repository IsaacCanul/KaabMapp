import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { openLogin } from "../navigation/navigationRef";

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();

  return useCallback(
    (action, { reason = "Inicia sesión para continuar." } = {}) => {
      if (!isAuthenticated) {
        openLogin({ reason });
        return false;
      }

      action?.();
      return true;
    },
    [isAuthenticated]
  );
}
