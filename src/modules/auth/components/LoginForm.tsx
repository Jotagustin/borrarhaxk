"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth";
import { ROUTES } from "@/config/routes";

export function LoginForm() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    try {
      await login({ email, password });
      router.push(ROUTES.dashboard.root);
      router.refresh();
    } catch {
      /* error expuesto por el hook (useAuth.error) */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>Iniciar sesión</h1>
      <p className="auth-subtitle">Accede para ver tus reportes.</p>

      {error && (
        <p role="alert" className="auth-error">
          {error.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="login-email">Correo electrónico</label>
        <input
          type="email"
          id="login-email"
          name="email"
          autoComplete="username"
          spellCheck="false"
          required
          data-error="login-email-error"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <div id="login-email-error" className="error-msg">
          <span role="img" aria-label="Error">❌</span> Ingresa un correo en el formato tu@ejemplo.com.
        </div>
      </div>

      <div className="field">
        <label htmlFor="login-password">Contraseña</label>
        <input
          type="password"
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
          data-error="login-password-error"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
        <div id="login-password-error" className="error-msg">
          <span role="img" aria-label="Error">❌</span> Ingresa tu contraseña.
        </div>
      </div>

      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Ingresando…" : "Ingresar"}
      </button>

      <p className="auth-subtitle">
        ¿No tienes cuenta?{" "}
        <Link href={ROUTES.auth.register}>Crear cuenta</Link>
      </p>
    </form>
  );
}

export default LoginForm;
