import type { Metadata } from "next";

import { LoginForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return <LoginForm />;
}
