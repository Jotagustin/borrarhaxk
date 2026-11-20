import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";

import { ROUTES } from "@/config/routes";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={shellStyle}>
      <header style={headerStyle}>
        <Link href={ROUTES.home} className="brand">
          Firewatch
        </Link>
      </header>
      <main style={mainStyle}>{children}</main>
    </div>
  );
}

const shellStyle: CSSProperties = {
  minHeight: "100vh",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  maxWidth: 1100,
  margin: "0 auto",
  padding: "1.25rem 1.5rem",
};

const mainStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "3rem 1.5rem",
};
