"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const nav = [
  {
    href: "/dashboard",
    label: "Reportes",
    hint: "Reportes de incendio clasificados",
    icon: "RE",
  },
  {
    href: "/analysis",
    label: "Análisis en vivo",
    hint: "Detección en tiempo real",
    icon: "AN",
  },
  {
    href: "/settings",
    label: "Ajustes",
    hint: "Perfil y preferencias",
    icon: "AJ",
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-head">
          <Link href="/" className="brand" aria-label="Firewatch">
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
              <svg viewBox="0 0 16 16">
                <path
                  d="M10 3 5 8l5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
                  {item.icon}
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
