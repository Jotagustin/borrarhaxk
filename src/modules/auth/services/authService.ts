/**
 * Capa de servicios del dominio auth.
 *
 * Regla: todo acceso HTTP pasa por `@/services/http` (cliente tipado con base
 * URL, headers JSON y `HttpError`). Este archivo no toca `fetch` directamente
 * ni conoce UI.
 */

import { httpClient, HttpError } from "@/services/http";
import type {
  AuthErrorResponse,
  AuthSession,
  LoginCredentials,
  RegisterPayload,
} from "@/modules/auth";
import { AUTH_ENDPOINTS } from "../types/endpoints";

/** Respuestas crudas del contrato HTTP de auth. */
type SessionEnvelope = { session: AuthSession };
type MaybeSessionEnvelope = { session: AuthSession | null };

/**
 * Error normalizado de la capa de servicios de auth.
 *
 * Envuelve el `AuthErrorResponse` del contrato para que la UI/hook tengan una
 * forma estable independientemente de si el fallo vino de la red o de la API.
 */
export class AuthServiceError extends Error {
  readonly error: AuthErrorResponse;

  constructor(error: AuthErrorResponse) {
    super(error.message);
    this.name = "AuthServiceError";
    this.error = error;
  }
}

function toAuthError(cause: unknown): AuthErrorResponse {
  if (cause instanceof HttpError) {
    return {
      message: cause.message,
      code: cause.code,
      details: cause.details,
    };
  }
  if (cause instanceof Error) {
    return { message: cause.message };
  }
  return { message: "Unexpected authentication error" };
}

async function run<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (cause) {
    throw new AuthServiceError(toAuthError(cause));
  }
}

/** POST /api/auth/login */
export function login(credentials: LoginCredentials): Promise<AuthSession> {
  return run(async () => {
    const { session } = await httpClient.post<SessionEnvelope>(
      AUTH_ENDPOINTS.login,
      credentials,
    );
    return session;
  });
}

/** POST /api/auth/register */
export function register(payload: RegisterPayload): Promise<AuthSession> {
  return run(async () => {
    const { session } = await httpClient.post<SessionEnvelope>(
      AUTH_ENDPOINTS.register,
      payload,
    );
    return session;
  });
}

/** POST /api/auth/logout */
export function logout(): Promise<void> {
  return run(async () => {
    await httpClient.post<unknown>(AUTH_ENDPOINTS.logout);
  });
}

/** GET /api/auth/session */
export function getSession(): Promise<AuthSession | null> {
  return run(async () => {
    const { session } = await httpClient.get<MaybeSessionEnvelope>(
      AUTH_ENDPOINTS.session,
    );
    return session;
  });
}

/** Agrupación de la API pública del servicio de auth. */
export const authService = {
  login,
  register,
  logout,
  getSession,
} as const;
