/**
 * API pública del módulo auth.
 *
 * Regla: otros módulos y `src/app/` deben importar únicamente desde este archivo
 * (`@/modules/auth`), nunca desde rutas internas del módulo.
 *
 * Stream 1 (contrato): solo se expone el contrato de tipos. Los streams de
 * servicios, UI y tests construyen sobre estos nombres exactos.
 */

export type {
  AuthErrorResponse,
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from "./types/dto";

export { AUTH_ENDPOINTS } from "./types/endpoints";

export type {
  AuthEndpoint,
  AuthResult,
  LoginRequest,
  LoginResponse,
  LoginResult,
  LogoutRequest,
  LogoutResponse,
  LogoutResult,
  RegisterRequest,
  RegisterResponse,
  RegisterResult,
  SessionRequest,
  SessionResponse,
  SessionResult,
} from "./types/endpoints";

/* Stream 2: capa de servicios. */

export {
  AuthServiceError,
  authService,
  getSession,
  login,
  logout,
  register,
} from "./services/authService";

/* Stream 2: hook de autenticación. */

export { useAuth } from "./hooks/useAuth";
export type { UseAuthResult } from "./hooks/useAuth";
export { useAriaInvalidSync } from "./hooks/useAriaInvalidSync";

/* Stream 3: UI de autenticación. */

export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
