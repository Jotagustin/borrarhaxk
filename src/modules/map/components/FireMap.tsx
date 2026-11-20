"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./fire-map.css";

import { BASE_LAYERS, OVERLAY_LAYERS, INITIAL_VIEW, OPACITY_OVERLAY } from "../config/layers";
import { createTileLayer } from "../services/tile-layers";
import { createFireZonesLayer } from "../services/fire-zones";
import { FIRE_ZONES } from "../data/fire-zones";
import type { FireZoneProperties } from "../types";

export interface FireMapProps {
  /** Centro inicial [lat, lng]. Por defecto: Santiago, Chile. */
  center?: [number, number];
  /** Zoom inicial. Por defecto: 13. */
  zoom?: number;
  /** Callback al hacer clic en una zona de incendio. */
  onZoneSelect?: (props: FireZoneProperties) => void;
}

/**
 * Mapa interactivo con Leaflet + Esri World Imagery.
 *
 * Se ejecuta solo en el cliente: Leaflet requiere `window`/`document`, por lo
 * que se importa dinámicamente dentro de `useEffect` para no romper el SSR de
 * Next.js.
 */
export default function FireMap({ center, zoom, onZoneSelect }: FireMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const onSelectRef = useRef(onZoneSelect);
  const [wheelZoomActive, setWheelZoomActive] = useState(false);

  // Mantiene el callback actualizado sin recrear el mapa.
  useEffect(() => {
    onSelectRef.current = onZoneSelect;
  }, [onZoneSelect]);

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
      // Fuera de él, el scroll de la página no queda capturado.
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

      // Vista por defecto: satelital.
      const satelliteConfig = BASE_LAYERS.find((config) => config.id === "satelite");
      if (satelliteConfig) {
        baseLayers[satelliteConfig.name].addTo(map);
      }

      // ---- Overlays transparentes (etiquetas) -----------------------------
      const overlayLayers: Record<string, L.TileLayer> = {};
      OVERLAY_LAYERS.forEach((config) => {
        overlayLayers[config.name] = createTileLayer(config);
      });

      // Por defecto activamos los nombres/límites de Esri Reference.
      const defaultOverlayName = OVERLAY_LAYERS[0]?.name;
      if (defaultOverlayName) {
        const overlay = overlayLayers[defaultOverlayName];
        overlay.setOpacity(OPACITY_OVERLAY);
        overlay.addTo(map);
      }

      // ---- Zonas de incendio (GeoJSON rojo semitransparente) ---------------
      const fireLayer = createFireZonesLayer(FIRE_ZONES, (props) => onSelectRef.current?.(props));
      fireLayer.addTo(map);

      // ---- Controles ------------------------------------------------------
      L.control.layers(baseLayers, { ...overlayLayers, "Zonas de incendio": fireLayer }, {
        position: "topright",
        collapsed: false,
      }).addTo(map);

      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      // Ajusta el tamaño tras el montaje (contenedores flex/grid).
      requestAnimationFrame(() => map.invalidateSize());
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // El mapa se crea una sola vez; los cambios de centro/zoom se ignoran aquí.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fire-map" role="application" aria-label="Mapa interactivo de incendios">
      <div ref={containerRef} className="fire-map__canvas" />

      <div
        className={`fire-map__scroll-hint${wheelZoomActive ? "" : " fire-map__scroll-hint--visible"}`}
        aria-hidden="true"
      >
        <span>Clic en el mapa para activar el zoom con la rueda</span>
      </div>

      <div className="fire-map__legend">
        <h4>Leyenda</h4>
        <ul>
          <li>
            <span className="dot" style={{ background: "rgba(239,68,68,0.35)", borderColor: "#b91c1c" }} />
            Zona de Incendio Activa
          </li>
        </ul>
      </div>
    </div>
  );
}
