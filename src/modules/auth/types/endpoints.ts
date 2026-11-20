/**
 * Contrato de endpoints HTTP del dominio auth.
 *
 * Describe cada ruta (petición/respuesta) y el resultado tipado que consumen
 * los servicios. Solo tipos y constantes de ruta: sin lógica ni fetch.
 */

import type {
  AuthErrorResponse,
  AuthSession,
  LoginCredentials,
  RegisterPayload,
} from "./dto";

/**
 * Rutas del contrato de auth, relativas a la base de la API
 * (`env.apiUrl`, p. ej. `http://localhost:4000/api`).
 */
export const AUTH_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  session: "/auth/session",
} as const;

/** Unión de todas las rutas válidas del contrato. */
export type AuthEndpoint =
  (typeof AUTH_ENDPOINTS)[keyof typeof AUTH_ENDPOINTS];

/* POST /api/auth/login */

export type LoginRequest = LoginCredentials;

export interface LoginResponse {
  session: AuthSession;
}

/* POST /api/auth/register */

export type RegisterRequest = RegisterPayload;

export interface RegisterResponse {
  session: AuthSession;
}

/* POST /api/auth/logout */

export type LogoutRequest = Record<string, never>;

export interface LogoutResponse {
  success: boolean;
}

/* GET /api/auth/session */

export type SessionRequest = Record<string, never>;

export interface SessionResponse {
  session: AuthSession | null;
}

/**
 * Resultado tipado de una llamada al contrato de auth.
 *
 * Unión discriminada `ok`: en éxito lleva `data`, en fallo lleva `error`.
 */
export type AuthResult<TResponse> =
  | { ok: true; data: TResponse }
  | { ok: false; error: AuthErrorResponse };

export type LoginResult = AuthResult<LoginResponse>;
export type RegisterResult = AuthResult<RegisterResponse>;
export type LogoutResult = AuthResult<LogoutResponse>;
export type SessionResult = AuthResult<SessionResponse>;
