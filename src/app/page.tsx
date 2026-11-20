"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleAccesoReporte = () => {
    try {
      sessionStorage.setItem("firewatch_demo_role", "reporte");
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
    router.push("/dashboard");
  };

  const handleAccesoGestor = () => {
    try {
      sessionStorage.setItem("firewatch_demo_role", "gestor");
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
    router.push("/analysis");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        background: "#f5f6f8",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "2.25rem",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "#f1f5f9",
              color: "#334155",
              fontSize: "0.78rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Inicio de Sesión Simbólico · Firewatch
          </span>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#0f172a" }}>
            Selecciona tu perfil de acceso
          </h1>
          <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "0.95rem" }}>
            Acceso directo con credenciales de demostración preconfiguradas.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Botón 1: Reporte -> /dashboard */}
          <div
            style={{
              border: "1px solid #fecaca",
              background: "#fffafa",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🔥</div>
              <h2
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#991b1b",
                  marginBottom: "0.35rem",
                }}
              >
                Reporte de Incendios
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                Reporta focos con fotografía y GPS en el mapa. La IA clasifica en
                tiempo real si la alerta es REAL o FALSA.
              </p>
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "0.6rem 0.75rem",
                  background: "#ffffff",
                  border: "1px solid #fee2e2",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  color: "#64748b",
                }}
              >
                <div>
                  <strong>Usuario:</strong> reporte@firewatch.cl
                </div>
                <div>
                  <strong>Destino:</strong> /dashboard
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAccesoReporte}
              className="btn-submit"
            >
              Iniciar sesión como Reporte
            </button>
          </div>

          {/* Botón 2: Gestor -> /analysis */}
          <div
            style={{
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🛰️</div>
              <h2
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "0.35rem",
                }}
              >
                Gestor de Operaciones
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>
                Accede al panel de gestión y análisis en vivo fotograma a
                fotograma con historial de eventos.
              </p>
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "0.6rem 0.75rem",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  color: "#64748b",
                }}
              >
                <div>
                  <strong>Usuario:</strong> gestor@firewatch.cl
                </div>
                <div>
                  <strong>Destino:</strong> /analysis
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAccesoGestor}
              style={{
                width: "100%",
                padding: "0.8rem 1rem",
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Iniciar sesión como Gestor
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
