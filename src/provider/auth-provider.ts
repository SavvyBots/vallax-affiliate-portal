import type { AuthProvider } from "@refinedev/core";
import { apiFetch } from "./api";

export type AuthSession = {
  session: unknown;
  user: unknown;
} | null;

export async function getCurrentSession(): Promise<AuthSession> {
  const session = await apiFetch<AuthSession>("/auth/get-session");
  return session?.session && session.user ? session : null;
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      await apiFetch("/auth/sign-in/email", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return { success: true, redirectTo: "/" };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "Login Error",
          message: error instanceof Error ? error.message : "Invalid credentials",
        },
      };
    }
  },
  check: async () => {
    try {
      const session = await getCurrentSession();
      if (session) return { authenticated: true };
    } catch {
      // Fall through to the unauthenticated result.
    }
    return { authenticated: false, redirectTo: "/login", logout: true };
  },
  logout: async () => {
    await apiFetch("/auth/sign-out", { method: "POST", body: JSON.stringify({}) });
    return { success: true, redirectTo: "/login" };
  },
  onError: async () => ({}),
  getPermissions: async () => null,
  getIdentity: async () => getCurrentSession(),
};
