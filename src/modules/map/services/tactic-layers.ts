import L from "leaflet";
import type { Firebreak, LatLng, WaterResource } from "../types";
import { EVACUATION_RADII_M } from "../data/fire-zones";

/**
 * Función táctica 3: capas de apoyo y evacuación.
 * Cada builder devuelve un L.LayerGroup listo para el control de capas.
 */

/** Anillos concéntricos de evacuación (500 m, 1 km, 2 km) desde el foco. */
export function createEvacuationRings(center: LatLng): L.LayerGroup {
  const group = L.layerGroup();
  const palette: Record<number, string> = {
    500: "#22c55e",
    1000: "#eab308",
    2000: "#ef4444",
  };

  EVACUATION_RADII_M.forEach((radius) => {
    const circle = L.circle(center, {
      radius,
      color: palette[radius] ?? "#38bdf8",
      weight: 2,
      opacity: 0.9,
      dashArray: "6 6",
      fill: true,
      fillColor: palette[radius] ?? "#38bdf8",
      fillOpacity: 0.06,
    });

    const km = radius >= 1000 ? `${radius / 1000} km` : `${radius} m`;
    circle.bindTooltip(`Anillo de evacuación · ${km}`, { sticky: true });
    group.addLayer(circle);
  });

  return group;
}

/** Icono distintivo por tipo de recurso de agua. */
function waterIcon(tipo: WaterResource["tipo"]): L.DivIcon {
  const emoji: Record<WaterResource["tipo"], string> = {
    Tranque: "🌊",
    Piscina: "🏊",
    Estanque: "💧",
    Grifo: "🚒",
  };
  return L.divIcon({
    className: "water-marker",
    html: `<div class="water-marker__inner"><span>${emoji[tipo] ?? "💧"}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/** Marcadores de puntos de agua (tranques, piscinas, estanques, grifos). */
export function createWaterResourcesLayer(resources: WaterResource[]): L.LayerGroup {
  const group = L.layerGroup();

  resources.forEach((res) => {
    const marker = L.marker(res.position, { icon: waterIcon(res.tipo) });
    marker.bindPopup(
      `<div class="tactic-popup">
        <h4>${res.nombre}</h4>
        <p><strong>Tipo:</strong> ${res.tipo}</p>
        <p><strong>Capacidad:</strong> ${res.capacidadL.toLocaleString("es-CL")} L</p>
      </div>`,
    );
    group.addLayer(marker);
  });

  return group;
}

/** Líneas punteadas amarillas para cortafuegos. */
export function createFirebreaksLayer(firebreaks: Firebreak[]): L.LayerGroup {
  const group = L.layerGroup();

  firebreaks.forEach((fb) => {
    const line = L.polyline(fb.path, {
      color: "#facc15",
      weight: 4,
      opacity: 0.95,
      dashArray: "10 8",
    });
    line.bindTooltip(`Cortafuegos · ${fb.nombre} (≈${fb.anchoM} m de ancho)`, { sticky: true });
    group.addLayer(line);
  });

  return group;
}
