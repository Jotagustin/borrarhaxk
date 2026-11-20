"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import type { IncidenteMapItem } from "@/components/FireMap";

const FireMap = dynamic(() => import("@/components/FireMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Cargando mapa satelital…</div>,
});

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const HIGH_CONFIDENCE = 80;

const SEVERITY_WEIGHT: Record<string, number> = {
  extrema: 4,
  alta: 3,
  media: 2,
  baja: 1,
};

function severityWeight(severidad: string): number {
  return SEVERITY_WEIGHT[severidad?.toLowerCase()] ?? 0;
}

/** Prioridad de despacho: REAL primero, luego severidad, luego confianza. */
function priorityScore(inc: IncidenteMapItem): number {
  const real = inc.veredicto_final === "REAL" ? 1000 : 0;
  return real + severityWeight(inc.severidad) * 100 + (inc.confianza ?? 0);
}

interface Metrics {
  total: number;
  reales: number;
  falsas: number;
  altaConfianza: number;
  severidadAlta: number;
}

function computeMetrics(incidentes: IncidenteMapItem[]): Metrics {
  return incidentes.reduce<Metrics>(
    (acc, inc) => {
      acc.total += 1;
      const esReal = inc.veredicto_final === "REAL";
      if (esReal) acc.reales += 1;
      else acc.falsas += 1;
      if (esReal && inc.confianza >= HIGH_CONFIDENCE) acc.altaConfianza += 1;
      if (severityWeight(inc.severidad) >= 3) acc.severidadAlta += 1;
      return acc;
    },
    { total: 0, reales: 0, falsas: 0, altaConfianza: 0, severidadAlta: 0 }
  );
}

export default function DecisionsPage() {
  const [incidentes, setIncidentes] = useState<IncidenteMapItem[]>([]);
  const [activeIncidente, setActiveIncidente] =
    useState<IncidenteMapItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendDown, setBackendDown] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch(`${BACKEND_URL}/incidentes`);
        if (!res.ok) throw new Error(`Backend respondió ${res.status}`);
        const data: IncidenteMapItem[] = await res.json();
        if (cancelled) return;
        setIncidentes(data);
        setBackendDown(false);
      } catch {
        if (!cancelled) setBackendDown(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => computeMetrics(incidentes), [incidentes]);

  const prioritized = useMemo(
    () => [...incidentes].sort((a, b) => priorityScore(b) - priorityScore(a)),
    [incidentes]
  );

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <h1>Panel de decisiones</h1>
          <p>
            Incidentes priorizados para despacho. Confirma focos reales y
            descarta alertas falsas de un vistazo.
          </p>
        </div>
        <span
          className={
            backendDown ? "badge-status-offline" : "badge-status-online"
          }
        >
          {backendDown ? "Backend no disponible" : "Backend FastAPI activo"}
        </span>
      </section>

      <section className="stats">
        <div className="stat stat-total">
          <span className="stat-value">{metrics.total}</span>
          <span className="stat-label">Incidentes totales</span>
        </div>
        <div className="stat stat-relevant">
          <span className="stat-value">{metrics.reales}</span>
          <span className="stat-label">Focos REAL confirmados</span>
        </div>
        <div className="stat stat-spam">
          <span className="stat-value">{metrics.falsas}</span>
          <span className="stat-label">Alertas FALSAS descartadas</span>
        </div>
        <div className="stat stat-review">
          <span className="stat-value">{metrics.altaConfianza}</span>
          <span className="stat-label">Alta confianza (≥{HIGH_CONFIDENCE}%)</span>
        </div>
        <div className="stat stat-alert">
          <span className="stat-value">{metrics.severidadAlta}</span>
          <span className="stat-label">Severidad alta o extrema</span>
        </div>
      </section>

      <section className="decision-layout">
        <div className="panel-card decision-map" style={{ padding: "0.75rem" }}>
          <FireMap
            selectedCoord={
              activeIncidente
                ? activeIncidente.origen.coordenadas_gps
                : { lat: -33.4489, lng: -70.6693 }
            }
            onCoordSelect={() => {
              /* En modo decisión el mapa no captura coordenadas nuevas. */
            }}
            incidentes={incidentes}
            activeIncidente={activeIncidente}
            onSelectIncidente={setActiveIncidente}
          />
        </div>

        <aside className="panel-card decision-queue">
          <h2>
            <span>🎯</span> Cola de prioridad
          </h2>

          {isLoading ? (
            <p className="muted">Cargando incidentes…</p>
          ) : prioritized.length === 0 ? (
            <p className="muted">
              Sin incidentes registrados todavía. Los reportes del terreno
              aparecerán aquí en cuanto se clasifiquen.
            </p>
          ) : (
            <ul className="decision-list">
              {prioritized.map((inc, index) => {
                const esReal = inc.veredicto_final === "REAL";
                const isActive =
                  activeIncidente?.id !== undefined &&
                  activeIncidente?.id === inc.id;
                return (
                  <li key={inc.id ?? index}>
                    <button
                      type="button"
                      className={`decision-item${
                        isActive ? " is-active" : ""
                      }${esReal ? " is-real" : " is-falsa"}`}
                      onClick={() => setActiveIncidente(inc)}
                    >
                      <div className="decision-item__rank mono">{index + 1}</div>
                      <div className="decision-item__body">
                        <div className="decision-item__top">
                          <span
                            className={`tag ${esReal ? "tag-alert" : "tag-ok"}`}
                          >
                            {inc.veredicto_final}
                          </span>
                          <span className="decision-item__type">
                            {inc.tipo_incidente}
                          </span>
                          <span className="confidence">{inc.confianza}%</span>
                        </div>
                        <div className="muted decision-item__meta">
                          Severidad {inc.severidad} · {inc.origen.fuente} ·{" "}
                          {inc.origen.coordenadas_gps.lat.toFixed(3)},{" "}
                          {inc.origen.coordenadas_gps.lng.toFixed(3)}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </section>
    </main>
  );
}
