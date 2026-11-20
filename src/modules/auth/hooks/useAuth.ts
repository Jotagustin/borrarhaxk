"use client";

/**
 * Hook de autenticación del módulo auth.
 *
 * Envuelve `authService` con estado de carga y error, y expone la sesión/usuario
 * actuales. No conoce la capa HTTP: consume el servicio del módulo.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AuthErrorResponse,
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from "@/modules/auth";
import { AuthServiceError, authService } from "../services/authService";

export interface UseAuthResult {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthErrorResponse | null;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
  clearError: () => void;
}

function toAuthError(cause: unknown): AuthErrorResponse {
  if (cause instanceof AuthServiceError) {
    return cause.error;
  }
  if (cause instanceof Error) {
    return { message: cause.message };
  }
  return { message: "Unexpected authentication error" };
}

export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthErrorResponse | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }
      try {
        return await operation();
      } catch (cause) {
        const normalized = toAuthError(cause);
        if (mountedRef.current) {
          setError(normalized);
        }
        throw cause;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const login = useCallback(
    (credentials: LoginCredentials) =>
      run(async () => {
        const next = await authService.login(credentials);
        if (mountedRef.current) setSession(next);
        return next;
      }),
    [run],
  );

  const register = useCallback(
    (payload: RegisterPayload) =>
      run(async () => {
        const next = await authService.register(payload);
        if (mountedRef.current) setSession(next);
        return next;
      }),
    [run],
  );

  const logout = useCallback(
    () =>
      run(async () => {
        await authService.logout();
        if (mountedRef.current) setSession(null);
      }),
    [run],
  );

  const refreshSession = useCallback(
    () =>
      run(async () => {
        const next = await authService.getSession();
        if (mountedRef.current) setSession(next);
        return next;
      }),
    [run],
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    void refreshSession().catch(() => undefined);
  }, [refreshSession]);

  return {
    user: session?.user ?? null,
    session,
    loading,
    error,
    login,
    register,
    logout,
    refreshSession,
    clearError,
  };
}
