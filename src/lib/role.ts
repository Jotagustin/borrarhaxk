/**
 * Rol de demostración de la sesión.
 *
 * La pantalla de acceso (`/`) guarda el rol elegido en `sessionStorage`; el
 * `AppShell` lo lee para mostrar a cada perfil solo las secciones de su caso de
 * uso. Es una simulación de acceso: no hay autenticación real detrás.
 */

export type DemoRole = "gestor" | "reporte";

export const ROLE_STORAGE_KEY = "firewatch_demo_role";

export const DEFAULT_ROLE: DemoRole = "reporte";

const ROLES: readonly DemoRole[] = ["gestor", "reporte"];

export function isDemoRole(value: unknown): value is DemoRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Rol activo, o `null` si aún no se eligió uno (p. ej. en el primer render SSR). */
export function getDemoRole(): DemoRole | null {
  try {
    const value = sessionStorage.getItem(ROLE_STORAGE_KEY);
    return isDemoRole(value) ? value : null;
  } catch {
    return null;
  }
}

export function setDemoRole(role: DemoRole): void {
  try {
    sessionStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {
    /* sessionStorage no disponible: el rol queda sin persistir */
  }
}
