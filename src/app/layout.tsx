import type { Metadata } from "next";
import type { ReactNode } from "react";
import { env } from "@/config";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: env.appName,
  description: "Aplicación web modular construida con Next.js",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
