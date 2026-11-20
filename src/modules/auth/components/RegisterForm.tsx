"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth";
import { ROUTES } from "@/config/routes";

const PASSWORD_RULES =
  "Ingresa una contraseña de al menos 8 caracteres, con mayúscula, minúscula, número y carácter especial.";

export function RegisterForm() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    try {
      await register({ name, email, password });
      router.push(ROUTES.dashboard.root);
      router.refresh();
    } catch {
      /* error expuesto por el hook (useAuth.error) */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>Crear cuenta</h1>
      <p className="auth-subtitle">Regístrate para reportar y analizar incendios.</p>

      {error && (
        <p role="alert" className="auth-error">
          {error.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="register-name">Nombre</label>
        <input
          type="text"
          id="register-name"
          name="name"
          autoComplete="name"
          required
          data-error="register-name-error"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <div id="register-name-error" className="error-msg">
          <span role="img" aria-label="Error">❌</span> Ingresa tu nombre.
        </div>
      </div>

      <div className="field">
        <label htmlFor="register-email">Correo electrónico</label>
        <input
          type="email"
          id="register-email"
          name="email"
          autoComplete="username"
          spellCheck="false"
          required
          data-error="register-email-error"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <div id="register-email-error" className="error-msg">
          <span role="img" aria-label="Error">❌</span> Ingresa un correo en el formato tu@ejemplo.com.
        </div>
      </div>

      <div className="field">
        <label htmlFor="register-password">Contraseña</label>
        <input
          type="password"
          id="register-password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
          aria-describedby="register-password-rules"
          data-error="register-password-error"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
        <div id="register-password-error" className="error-msg">
          <span role="img" aria-label="Error">❌</span> {PASSWORD_RULES}
        </div>
      </div>

      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="auth-subtitle">
        ¿Ya tienes cuenta? <Link href={ROUTES.auth.login}>Iniciar sesión</Link>
      </p>
    </form>
  );
}

export default RegisterForm;
