"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./fire-map.css";

import { BASE_LAYERS, OVERLAY_LAYERS, INITIAL_VIEW, OPACITY_OVERLAY } from "../config/layers";
import { createTileLayer } from "../services/tile-layers";
import { createFireZonesLayer } from "../services/fire-zones";
import {
  createEvacuationRings,
  createFirebreaksLayer,
  createWaterResourcesLayer,
} from "../services/tactic-layers";
import { createWindArrow, type WindArrow } from "../services/wind-arrow";
import { setupDrawingTools } from "../services/drawing";
import { loadTurf, type TurfLike } from "../services/turf";
import {
  evaluateRule303030,
  fetchCurrentWeather,
  fireSpreadBearing,
  windCardinal,
} from "../services/weather";
import { FIRE_ZONES, FIREBREAKS, WATER_RESOURCES } from "../data/fire-zones";
import { ANATOMY_LEGEND } from "../lib/anatomy";
import type { FireZoneProperties, Rule303030Result, WeatherData } from "../types";

export interface FireMapProps {
  /** Centro inicial [lat, lng]. Por defecto: Santiago, Chile. */
  center?: [number, number];
  /** Zoom inicial. Por defecto: 13. */
  zoom?: number;
  /** Callback al hacer clic en una zona de incendio. */
  onZoneSelect?: (props: FireZoneProperties) => void;
}

/** Foco principal usado para el HUD de clima y la flecha de viento. */
const PRIMARY_ZONE = FIRE_ZONES.features[0].properties;

/**
 * Mapa interactivo táctico con Leaflet + Esri World Imagery.
 *
 * Se ejecuta solo en el cliente: Leaflet y los plugins (Turf.js, Geoman) se
 * cargan dinámicamente para no romper el SSR de Next.js.
 */
export default function FireMap({ center, zoom, onZoneSelect }: FireMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const windArrowRef = useRef<WindArrow | null>(null);
  const onSelectRef = useRef(onZoneSelect);

  const [wheelZoomActive, setWheelZoomActive] = useState(false);

  // --- Estado del clima / alerta 30-30-30 (Función táctica 1) ---
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [rule, setRule] = useState<Rule303030Result | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Mantiene el callback actualizado sin recrear el mapa.
  useEffect(() => {
    onSelectRef.current = onZoneSelect;
  }, [onZoneSelect]);

  // ---------------------------------------------------------------------
  // Construcción del mapa (una sola vez)
  // ---------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const initialCenter = center ?? INITIAL_VIEW.center;
      const initialZoom = zoom ?? INITIAL_VIEW.zoom;

      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        scrollWheelZoom: false,
        worldCopyJump: true,
      });
      mapRef.current = map;

      // Scroll lock: la rueda hace zoom solo tras hacer clic en el mapa.
      map.on("click", () => {
        map.scrollWheelZoom.enable();
        setWheelZoomActive(true);
      });
      map.on("mouseout", () => {
        map.scrollWheelZoom.disable();
        setWheelZoomActive(false);
      });

      // ---- Capas base -----------------------------------------------------
      const baseLayers: Record<string, L.TileLayer> = {};
      BASE_LAYERS.forEach((config) => {
        baseLayers[config.name] = createTileLayer(config);
      });

      const satelliteConfig = BASE_LAYERS.find((config) => config.id === "satelite");
      if (satelliteConfig) baseLayers[satelliteConfig.name].addTo(map);

      // ---- Overlays transparentes (etiquetas) -----------------------------
      const overlayLayers: Record<string, L.TileLayer> = {};
      OVERLAY_LAYERS.forEach((config) => {
        overlayLayers[config.name] = createTileLayer(config);
      });

      const defaultOverlayName = OVERLAY_LAYERS[0]?.name;
      if (defaultOverlayName) {
        const overlay = overlayLayers[defaultOverlayName];
        overlay.setOpacity(OPACITY_OVERLAY);
        overlay.addTo(map);
      }

      // ---- Turf.js (hectáreas) --------------------------------------------
      let turf: TurfLike | undefined;
      try {
        turf = await loadTurf();
      } catch (err) {
        console.warn("No se pudo cargar Turf.js:", err);
      }
      if (cancelled || !mapRef.current) return;

      // ---- Zonas de incendio (anatomía + origen + popups) -----------------
      const fireLayer = createFireZonesLayer(
        FIRE_ZONES,
        (props) => onSelectRef.current?.(props),
        turf,
      );
      fireLayer.addTo(map);

      // ---- Capas tácticas de apoyo (Función táctica 3) --------------------
      const evacLayer = createEvacuationRings(PRIMARY_ZONE.origen);
      const waterLayer = createWaterResourcesLayer(WATER_RESOURCES);
      const firebreakLayer = createFirebreaksLayer(FIREBREAKS);

      // ---- Flecha de propagación del fuego (Función táctica 1) ------------
      const windArrow = createWindArrow(PRIMARY_ZONE.origen, 0);
      windArrowRef.current = windArrow;
      windArrow.layer.addTo(map);

      // ---- Control de capas -----------------------------------------------
      L.control
        .layers(
          baseLayers,
          {
            ...overlayLayers,
            "🔥 Zonas de incendio": fireLayer,
            "⭕ Anillos de evacuación": evacLayer,
            "💧 Recursos y cortafuegos": firebreakLayer,
          },
          { position: "topright", collapsed: true },
        )
        .addTo(map);

      // Activa por defecto recursos/cortafuegos y anillos.
      waterLayer.addTo(map);
      firebreakLayer.addTo(map);

      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      // ---- Herramientas de dibujo/medición (Función táctica 4) ------------
      setupDrawingTools(map).catch((err) => console.warn("Geoman no disponible:", err));

      requestAnimationFrame(() => map.invalidateSize());
    })();

    return () => {
      cancelled = true;
      windArrowRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------
  // Clima en tiempo real (Open-Meteo) + Regla 30-30-30
  // ---------------------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();
    let timer: number | undefined;

    const load = async () => {
      try {
        const data = await fetchCurrentWeather(
          PRIMARY_ZONE.origen[0],
          PRIMARY_ZONE.origen[1],
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setWeather(data);
        setRule(evaluateRule303030(data));
        setWeatherError(null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setWeatherError("No se pudo obtener el clima en tiempo real.");
      }
    };

    load();
    // Refresca cada 10 minutos.
    timer = window.setInterval(load, 10 * 60 * 1000);

    return () => {
      controller.abort();
      if (timer) window.clearInterval(timer);
    };
  }, []);

  // Rota la flecha de viento cuando llega/actualiza el clima.
  useEffect(() => {
    if (!weather) return;
    const bearing = fireSpreadBearing(weather.windDirection);
    windArrowRef.current?.setBearing(bearing);
  }, [weather]);

  const extreme = rule?.active ?? false;

  return (
    <div className="fire-map" role="application" aria-label="Mapa táctico de incendios">
      <div ref={containerRef} className="fire-map__canvas" />

      {/* Hint de scroll */}
      <div
        className={`fire-map__scroll-hint${wheelZoomActive ? "" : " fire-map__scroll-hint--visible"}`}
        aria-hidden="true"
      >
        <span>Clic en el mapa para activar el zoom con la rueda</span>
      </div>

      {/* ================= HUD de clima (Función táctica 1) ================= */}
      <div className={`weather-hud${extreme ? " weather-hud--extreme" : ""}`}>
        <div className="weather-hud__header">
          <span className="weather-hud__title">Clima en el foco</span>
          <span className="weather-hud__place">{PRIMARY_ZONE.nombre}</span>
        </div>

        {weatherError && <p className="weather-hud__error">{weatherError}</p>}

        {!weather && !weatherError && <p className="weather-hud__loading">Consultando Open-Meteo…</p>}

        {weather && (
          <>
            <div className="weather-hud__grid">
              <div className="weather-hud__metric">
                <span className="weather-hud__value">{weather.temperature.toFixed(1)}°</span>
                <span className="weather-hud__label">Temperatura</span>
              </div>
              <div className="weather-hud__metric">
                <span className="weather-hud__value">{Math.round(weather.humidity)}%</span>
                <span className="weather-hud__label">Humedad</span>
              </div>
              <div className="weather-hud__metric">
                <span className="weather-hud__value">{weather.windSpeed.toFixed(1)}</span>
                <span className="weather-hud__label">Viento km/h</span>
              </div>
              <div className="weather-hud__metric">
                <span className="weather-hud__value">{windCardinal(weather.windDirection)}</span>
                <span className="weather-hud__label">{Math.round(weather.windDirection)}° dir.</span>
              </div>
            </div>

            {extreme && (
              <div className="weather-hud__alert" role="alert">
                ⚠️ RIESGO EXTREMO DE PROPAGACIÓN
                <span className="weather-hud__alert-rule">Regla 30-30-30 activa</span>
              </div>
            )}

            <p className="weather-hud__source">Fuente: Open-Meteo · sin API Key</p>
          </>
        )}
      </div>

      {/* ================= Leyenda de anatomía (Función táctica 2) ========== */}
      <div className="fire-map__legend">
        <h4>Anatomía del incendio</h4>
        <ul>
          {ANATOMY_LEGEND.map((item) => (
            <li key={item.label}>
              <span className="dot" style={{ background: item.fill, borderColor: item.border }} />
              {item.label}
            </li>
          ))}
          <li>
            <span className="dot" style={{ background: "#fff", borderColor: "#b91c1c" }}>🔥</span>
            Punto de Origen
          </li>
          <li>
            <span className="dot" style={{ background: "rgba(250,204,21,0.9)", borderColor: "#ca8a04" }} />
            Cortafuegos
          </li>
        </ul>
        <p className="fire-map__legend-note">Hectáreas calculadas con Turf.js</p>
      </div>
    </div>
  );
}
