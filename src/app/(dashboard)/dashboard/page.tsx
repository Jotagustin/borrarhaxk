"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { IncidenteMapItem } from "@/components/FireMap";

// Carga dinámica del mapa para evitar errores de SSR con Leaflet
const FireMap = dynamic(() => import("@/components/FireMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "520px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        borderRadius: "12px",
        color: "#64748b",
        fontSize: "0.95rem",
      }}
    >
      Cargando mapa satelital y telemetría...
    </div>
  ),
});

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function DashboardPage() {
  // Estado del formulario
  const [fuente, setFuente] = useState<"dron" | "celular">("dron");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -33.4489,
    lng: -70.6693,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Estados de interacción y datos
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [incidentes, setIncidentes] = useState<IncidenteMapItem[]>([]);
  const [activeIncidente, setActiveIncidente] =
    useState<IncidenteMapItem | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar historial inicial desde el backend
  useEffect(() => {
    async function loadHistorial() {
      try {
        setIsLoadingHistory(true);
        const res = await fetch(`${BACKEND_URL}/incidentes`);
        if (res.ok) {
          const data: IncidenteMapItem[] = await res.json();
          setIncidentes(data);
          if (data.length > 0) {
            setActiveIncidente(data[0]);
          }
        }
      } catch (err) {
        console.warn(
          "Backend no disponible para cargar historial inicial en localhost:8000",
          err
        );
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistorial();
  }, []);

  // Manejar selección de archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setErrorMessage(null);
    }
  };

  // Manejar clic en mapa para actualizar coordenadas
  const handleCoordSelect = (newCoord: { lat: number; lng: number }) => {
    setCoords(newCoord);
  };

  // Envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Por favor selecciona una imagen para clasificar.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fuente", fuente);
    formData.append("lat", coords.lat.toString());
    formData.append("lng", coords.lng.toString());

    try {
      const res = await fetch(`${BACKEND_URL}/clasificar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errDetail = await res.text();
        throw new Error(
          `Error en backend (${res.status}): ${errDetail || "Fallo en clasificación"}`
        );
      }

      const resultado: IncidenteMapItem = await res.json();

      // Actualizar incidentes en el mapa y activar el nuevo resultado
      setIncidentes((prev) => [resultado, ...prev]);
      setActiveIncidente(resultado);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "No se pudo conectar con el servidor backend en http://localhost:8000. Asegúrate de que esté activo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ← Volver al inicio
            </Link>
          </div>
          <h1>Centro de Verificación de Incendios Forestales</h1>
          <p>
            Análisis forense de imágenes, metadatos EXIF de dispositivo y
            detección con DeepSeek IA.
          </p>
        </div>
      </header>

      {/* Grid principal */}
      <div className="monitor-layout">
        {/* Columna Izquierda: Formulario de Carga */}
        <div className="panel-card">
          <h2>
            <span>🛰️</span> Nuevo Análisis de Campo
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Selector de Fuente */}
            <div className="form-group">
              <label>Tipo de Fuente de Captura</label>
              <div className="source-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${fuente === "dron" ? "active" : ""}`}
                  onClick={() => setFuente("dron")}
                >
                  <span>🚁</span> Dron Aéreo
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${fuente === "celular" ? "active" : ""}`}
                  onClick={() => setFuente("celular")}
                >
                  <span>📱</span> Celular / Móvil
                </button>
              </div>
            </div>

            {/* Coordenadas GPS */}
            <div className="form-group">
              <label>
                Coordenadas GPS (Haz clic en el mapa para posicionar)
              </label>
              <div className="coords-row">
                <div>
                  <input
                    type="number"
                    step="any"
                    value={coords.lat}
                    onChange={(e) =>
                      setCoords({ ...coords, lat: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field"
                    placeholder="Latitud"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    value={coords.lng}
                    onChange={(e) =>
                      setCoords({ ...coords, lng: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field"
                    placeholder="Longitud"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dropzone de imagen */}
            <div className="form-group">
              <label>Fotografía del Incidente (para extracción EXIF)</label>
              <div
                className={`file-dropzone ${selectedFile ? "has-file" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  style={{ display: "none" }}
                />
                {!previewUrl ? (
                  <div>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                      📷
                    </div>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>
                      Haz clic para subir fotografía
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      JPG, PNG, HEIC (con o sin EXIF)
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="file-preview">
                      <img src={previewUrl} alt="Vista previa del reporte" />
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        marginTop: "0.4rem",
                        color: "#059669",
                        fontWeight: 600,
                      }}
                    >
                      ✓ {selectedFile?.name} (
                      {((selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      Haz clic para cambiar de foto
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje de Error si ocurre */}
            {errorMessage && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                <strong>Error:</strong> {errorMessage}
              </div>
            )}

            {/* Botón de Submit con Loader */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="btn-submit"
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: "2px solid #ffffff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <span>Clasificando con IA y EXIF...</span>
                </>
              ) : (
                <>
                  <span>🔥</span>
                  <span>Verificar y Clasificar Incidente</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Mapa y Tarjeta de Veredicto */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Componente del Mapa */}
          <div className="panel-card" style={{ padding: "0.75rem" }}>
            <FireMap
              selectedCoord={coords}
              onCoordSelect={handleCoordSelect}
              incidentes={incidentes}
              activeIncidente={activeIncidente}
              onSelectIncidente={(inc) => setActiveIncidente(inc)}
            />
          </div>

          {/* Tarjeta de Veredicto / Resultado Activo */}
          {activeIncidente ? (
            <div
              className={`veredicto-card ${
                activeIncidente.veredicto_final === "REAL" ? "real" : "falsa"
              }`}
            >
              <div className="veredicto-header">
                <div>
                  <span
                    className={`badge-veredicto ${
                      activeIncidente.veredicto_final === "REAL"
                        ? "real"
                        : "falsa"
                    }`}
                  >
                    Veredicto: {activeIncidente.veredicto_final}
                  </span>
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  >
                    Tipo:{" "}
                    {activeIncidente.tipo_incidente.toUpperCase()} • Severidad:{" "}
                    {activeIncidente.severidad.toUpperCase()}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color:
                      activeIncidente.veredicto_final === "REAL"
                        ? "#b91c1c"
                        : "#047857",
                  }}
                >
                  Confianza: {activeIncidente.confianza}%
                </div>
              </div>

              {/* Video del análisis (Gemini) */}
              <video
                className="veredicto-video"
                src="/analysis-result.mp4"
                controls
                autoPlay
                muted
                loop
                playsInline
                aria-label="Reproducción del análisis del incidente"
              />

              {/* Metadatos de Origen */}
              <div className="origen-meta-grid">
                <div className="meta-field">
                  <strong>Fuente</strong>
                  <span>{activeIncidente.origen.fuente.toUpperCase()}</span>
                </div>
                <div className="meta-field">
                  <strong>Dispositivo Detectado</strong>
                  <span>{activeIncidente.origen.dispositivo}</span>
                </div>
                <div className="meta-field">
                  <strong>Fecha de Captura</strong>
                  <span>{activeIncidente.origen.fecha_captura}</span>
                </div>
                <div className="meta-field">
                  <strong>Coordenadas GPS</strong>
                  <span>
                    {activeIncidente.origen.coordenadas_gps.lat.toFixed(4)},{" "}
                    {activeIncidente.origen.coordenadas_gps.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Campo Explicativo 'porque' */}
              <div className="porque-box">
                <strong
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  Dictamen Técnico Forense:
                </strong>
                {activeIncidente.porque}
              </div>
            </div>
          ) : (
            <div
              className="panel-card"
              style={{
                textAlign: "center",
                color: "#64748b",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                🛰️
              </div>
              <p style={{ fontWeight: 600, color: "#1e293b" }}>
                Sin incidentes seleccionados
              </p>
              <p style={{ fontSize: "0.85rem" }}>
                Haz clic en cualquier punto del mapa y sube una fotografía para
                iniciar el análisis forense.
              </p>
            </div>
          )}

          {/* Historial de Incidentes Registrados */}
          {incidentes.length > 0 && (
            <div className="panel-card">
              <h2>
                <span>📋</span> Historial Reciente de Incidentes en SQLite
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Veredicto</th>
                      <th>Tipo</th>
                      <th>Fuente</th>
                      <th>Dispositivo</th>
                      <th>Fecha</th>
                      <th>GPS</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentes.map((inc, index) => (
                      <tr
                        key={inc.id || index}
                        style={{
                          cursor: "pointer",
                          background:
                            activeIncidente?.id === inc.id
                              ? "#f1f5f9"
                              : "transparent",
                        }}
                        onClick={() => setActiveIncidente(inc)}
                      >
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                inc.veredicto_final === "REAL"
                                  ? "#dc2626"
                                  : "#10b981",
                            }}
                          >
                            {inc.veredicto_final}
                          </span>
                        </td>
                        <td>{inc.tipo_incidente}</td>
                        <td>{inc.origen.fuente}</td>
                        <td
                          style={{
                            maxWidth: "180px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={inc.origen.dispositivo}
                        >
                          {inc.origen.dispositivo}
                        </td>
                        <td>{inc.origen.fecha_captura.split(" ")[0]}</td>
                        <td>
                          {inc.origen.coordenadas_gps.lat.toFixed(2)},{" "}
                          {inc.origen.coordenadas_gps.lng.toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveIncidente(inc);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#2563eb",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            Ver en mapa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
