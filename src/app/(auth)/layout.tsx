"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { ROUTES } from "@/config/routes";
import { useAriaInvalidSync } from "@/modules/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  useAriaInvalidSync();

  return (
    <div className="auth-shell">
      <header className="auth-header">
        <Link href={ROUTES.home} className="brand">
          Firewatch
        </Link>
      </header>
      <main className="auth-main">{children}</main>
    </div>
  );
}
