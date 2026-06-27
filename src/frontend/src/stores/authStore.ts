import type { UserRole } from "@/backend";
import { useCallerUserRole, useIsCallerAdmin } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect } from "react";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: UserRole | null;
  principal: string | null;
  setAuth: (auth: {
    isAuthenticated: boolean;
    isAdmin: boolean;
    userRole: UserRole | null;
    principal: string | null;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAdmin: false,
  userRole: null,
  principal: null,
  setAuth: (auth) => set(auth),
  clearAuth: () =>
    set({
      isAuthenticated: false,
      isAdmin: false,
      userRole: null,
      principal: null,
    }),
}));

export function useAuthSync() {
  const { identity, loginStatus } = useInternetIdentity();
  const { setAuth, clearAuth } = useAuthStore();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: userRole = null } = useCallerUserRole();

  useEffect(() => {
    if (loginStatus === "success" && identity) {
      setAuth({
        isAuthenticated: true,
        isAdmin,
        userRole,
        principal: identity.getPrincipal().toText(),
      });
    } else if (loginStatus === "idle") {
      clearAuth();
    }
  }, [identity, loginStatus, setAuth, clearAuth, isAdmin, userRole]);
}
