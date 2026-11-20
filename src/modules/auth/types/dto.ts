/**
 * DTOs del dominio auth.
 *
 * Solo tipos: sin lógica, sin fetch, sin UI. Estas son las formas que viajan
 * por el contrato HTTP y se comparten entre servicios, UI y tests.
 */

/** Credenciales de inicio de sesión. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Datos necesarios para registrar una cuenta nueva. */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/** Usuario autenticado tal como lo expone la API. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/** Sesión autenticada activa. */
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

/** Error normalizado devuelto por los endpoints de auth. */
export interface AuthErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
