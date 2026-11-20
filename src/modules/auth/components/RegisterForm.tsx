"use client";

import { useState, type CSSProperties, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth";
import { ROUTES } from "@/config/routes";

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
    <form onSubmit={handleSubmit} style={formStyle} noValidate>
      <h1 style={titleStyle}>Crear cuenta</h1>
      <p style={subtitleStyle}>Regístrate para reportar y analizar incendios.</p>

      {error && (
        <p role="alert" style={errorStyle}>
          {error.message}
        </p>
      )}

      <label style={labelStyle}>
        Nombre
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Correo electrónico
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Contraseña
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </label>

      <button type="submit" className="btn" disabled={loading} style={submitStyle}>
        {loading ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p style={subtitleStyle}>
        ¿Ya tienes cuenta? <Link href={ROUTES.auth.login}>Iniciar sesión</Link>
      </p>
    </form>
  );
}

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.85rem",
  background: "#fff",
  border: "1px solid #e3e6ea",
  borderRadius: 10,
  padding: "2rem",
  width: "100%",
  maxWidth: 380,
};

const titleStyle: CSSProperties = {
  fontSize: "1.35rem",
  letterSpacing: "-0.02em",
};

const subtitleStyle: CSSProperties = {
  color: "#6b7280",
  fontSize: "0.875rem",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem",
  fontSize: "0.85rem",
  color: "#374151",
};

const inputStyle: CSSProperties = {
  border: "1px solid #d3d8df",
  borderRadius: 8,
  padding: "0.5rem 0.65rem",
  fontSize: "0.9rem",
};

const errorStyle: CSSProperties = {
  color: "#a3241a",
  background: "#fdecea",
  border: "1px solid #f6c9c4",
  borderRadius: 8,
  padding: "0.5rem 0.65rem",
  fontSize: "0.85rem",
};

const submitStyle: CSSProperties = {
  marginTop: "0.25rem",
};

export default RegisterForm;
