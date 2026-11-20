"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface IncidenteMapItem {
  id?: number | string;
  veredicto_final: "REAL" | "FALSA" | string;
  es_alerta_valida: boolean;
  tipo_incidente: string;
  severidad: string;
  confianza: number;
  origen: {
    fuente: string;
    dispositivo: string;
    fecha_captura: string;
    coordenadas_gps: {
      lat: number;
      lng: number;
    };
  };
  porque: string;
}

interface FireMapProps {
  selectedCoord: { lat: number; lng: number };
  onCoordSelect: (coord: { lat: number; lng: number }) => void;
  incidentes: IncidenteMapItem[];
  activeIncidente: IncidenteMapItem | null;
  onSelectIncidente: (incidente: IncidenteMapItem) => void;
}

// Iconos personalizados con SVG para no depender de URLs de assets rotos de Leaflet
function createCustomPin(color: string, isReal: boolean) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
      <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3.5" fill="#ffffff" />
      ${
        isReal
          ? '<circle cx="12" cy="9" r="2" fill="' + color + '"/>'
          : '<path d="M10.5 9l1 1 2-2" stroke="' + color + '" stroke-width="1.2" fill="none"/>'
      }
    </svg>
  `;

  return L.divIcon({
    className: "custom-map-pin",
    html: svg,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });
}

function createSelectedTargetPin() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">
      <circle cx="12" cy="12" r="9" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="12" cy="12" r="4" fill="#2563eb"/>
    </svg>
  `;
  return L.divIcon({
    className: "target-map-pin",
    html: svg,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function FireMap({
  selectedCoord,
  onCoordSelect,
  incidentes,
  activeIncidente,
  onSelectIncidente,
}: FireMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [selectedCoord.lat, selectedCoord.lng],
      11
    );

    // Capa de tiles OpenStreetMap estándar
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Marcador de punto seleccionado para nuevo reporte
    const targetMarker = L.marker([selectedCoord.lat, selectedCoord.lng], {
      icon: createSelectedTargetPin(),
      zIndexOffset: 1000,
    }).addTo(map);
    targetMarkerRef.current = targetMarker;

    // Evento de clic en el mapa para fijar coordenadas
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onCoordSelect({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar la posición del cursor/target seleccionado
  useEffect(() => {
    if (targetMarkerRef.current) {
      targetMarkerRef.current.setLatLng([selectedCoord.lat, selectedCoord.lng]);
    }
  }, [selectedCoord]);

  // Renderizar incidentes y sus pines
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    incidentes.forEach((inc) => {
      const isReal = inc.veredicto_final === "REAL";
      // Rojo brillante (#dc2626) si es REAL; Gris/Verde (#10b981 / #6b7280) si es FALSA
      const color = isReal ? "#dc2626" : "#10b981";
      const icon = createCustomPin(color, isReal);

      const lat = inc.origen.coordenadas_gps.lat;
      const lng = inc.origen.coordenadas_gps.lng;

      const marker = L.marker([lat, lng], { icon });

      // Popup informativo con contrato
      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: ${isReal ? "#dc2626" : "#059669"}; font-size: 14px;">
              ${isReal ? "🔥 ALERTA REAL" : "✅ ALERTA FALSA"}
            </strong>
            <span style="font-size: 11px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
              ${inc.confianza}% conf.
            </span>
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Fuente:</strong> ${inc.origen.fuente.toUpperCase()}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Dispositivo:</strong> ${inc.origen.dispositivo}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Fecha:</strong> ${inc.origen.fecha_captura}
          </div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; color: #475569; font-style: italic;">
            "${inc.porque}"
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        onSelectIncidente(inc);
      });

      layer.addLayer(marker);
    });
  }, [incidentes, onSelectIncidente]);

  // Si hay un incidente activo recién clasificado, centrar en él y abrir su popup si aplica
  useEffect(() => {
    if (!mapInstanceRef.current || !activeIncidente) return;
    const { lat, lng } = activeIncidente.origen.coordenadas_gps;
    mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
  }, [activeIncidente]);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" style={{ height: "100%", minHeight: "480px" }} />
      <div className="map-legend">
        <div className="legend-item">
          <span className="dot dot-real"></span>
          <span>Incendio REAL (Confirmado)</span>
        </div>
        <div className="legend-item">
          <span className="dot dot-falsa"></span>
          <span>Alerta FALSA (Descartada)</span>
        </div>
        <div className="legend-item">
          <span className="dot dot-target"></span>
          <span>Ubicación seleccionada (Haz clic en el mapa)</span>
        </div>
      </div>
    </div>
  );
}
