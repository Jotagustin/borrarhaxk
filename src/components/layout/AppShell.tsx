"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ChevronLeft,
  Flame,
  Activity,
  Settings,
  Gauge,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/config/routes";
import { useDemoRole } from "@/hooks/useDemoRole";
import type { DemoRole } from "@/lib/role";

interface NavItem {
  href: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
}

const reporteNav: NavItem[] = [
  {
    href: ROUTES.dashboard.root,
    label: "Reportar incendio",
    hint: "Sube foto y GPS, la IA clasifica",
    Icon: Flame,
  },
  {
    href: ROUTES.dashboard.analysis,
    label: "Análisis en vivo",
    hint: "Detección en tiempo real",
    Icon: Activity,
  },
  {
    href: ROUTES.dashboard.settings,
    label: "Ajustes",
    hint: "Perfil y preferencias",
    Icon: Settings,
  },
];

const gestorNav: NavItem[] = [
  {
    href: ROUTES.dashboard.decisions,
    label: "Panel de decisiones",
    hint: "Incidentes priorizados para despacho",
    Icon: Gauge,
  },
];

const NAV_BY_ROLE: Record<DemoRole, NavItem[]> = {
  reporte: reporteNav,
  gestor: gestorNav,
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const role = useDemoRole();
  const [collapsed, setCollapsed] = useState(false);

  // Sin rol resuelto todavía: menú completo como fallback neutral.
  const nav = role ? NAV_BY_ROLE[role] : reporteNav;

  return (
    <div className={`shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-head">
          <Link href={ROUTES.home} className="brand" aria-label="Firewatch">
            <span className="brand-mark">FW</span>
            <span className="sidebar-label">Firewatch</span>
          </Link>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            <span className="sidebar-toggle-icon" aria-hidden>
              <ChevronLeft />
            </span>
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? "is-active" : ""}`}
                title={item.label}
              >
                <span className="sidebar-icon" aria-hidden>
                  <item.Icon />
                </span>
                <span className="sidebar-text">
                  <span className="sidebar-link-label">{item.label}</span>
                  <span className="sidebar-hint">{item.hint}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <span className="muted sidebar-hint">Firewatch · v0.1</span>
        </div>
      </aside>

      <div className="shell-main">
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;

