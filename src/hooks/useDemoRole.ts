"use client";

import { useEffect, useState } from "react";

import { getDemoRole, type DemoRole } from "@/lib/role";

/**
 * Devuelve el rol de demostración activo.
 *
 * `sessionStorage` solo existe en el cliente, así que el primer render (SSR y
 * primer paint) devuelve `null` y el valor real llega tras montar. Consumidores
 * deben tratar `null` como "todavía sin resolver", no como "sin rol".
 */
export function useDemoRole(): DemoRole | null {
  const [role, setRole] = useState<DemoRole | null>(null);

  useEffect(() => {
    setRole(getDemoRole());
  }, []);

  return role;
}
