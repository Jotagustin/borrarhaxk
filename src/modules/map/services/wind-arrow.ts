import L from "leaflet";
import type { LatLng } from "../types";
import { destinationPoint, fireSpreadBearing } from "../services/weather";

/**
 * Flecha de propagación del fuego.
 *
 * Se dibuja como una polilínea + un marcador con forma de flecha (divIcon)
 * en la punta, orientado hacia donde AVANZA el fuego (bearing de propagación),
 * y se actualiza con `setBearing` cuando cambia el viento.
 */
export interface WindArrow {
  layer: L.LayerGroup;
  /** Cabecera/punta que rota. */
  setBearing: (bearingDeg: number) => void;
}

/** Longitud de la flecha en metros (fija, para que sea visible). */
const ARROW_LENGTH_M = 900;

/**
 * Crea la flecha de viento anclada a un punto de origen.
 * @param origin Punto de origen del incendio [lat, lng].
 * @param initialBearing Rumbo inicial (°).
 */
export function createWindArrow(origin: LatLng, initialBearing = 0): WindArrow {
  const group = L.layerGroup();

  // Cuerpo de la flecha (línea) + punta (divIcon rotable).
  const line = L.polyline([origin, origin], {
    color: "#facc15",
    weight: 4,
    opacity: 0.95,
    dashArray: "1 0",
  });

  const head = L.marker(origin, {
    interactive: false,
    icon: L.divIcon({
      className: "wind-arrow-head",
      html: `<div class="wind-arrow-head__inner" style="transform: rotate(0deg)">➤</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    }),
  });

  group.addLayer(line);
  group.addLayer(head);

  const setBearing = (bearingDeg: number): void => {
    const tip = destinationPoint(origin, bearingDeg, ARROW_LENGTH_M);
    line.setLatLngs([L.latLng(origin), L.latLng(tip)]);

    const headEl = head.getElement()?.querySelector<HTMLElement>(".wind-arrow-head__inner");
    if (headEl) {
      // ➤ apunta hacia la derecha (90°), por eso restamos 90°.
      headEl.style.transform = `rotate(${bearingDeg - 90}deg)`;
    }
    head.setLatLng(L.latLng(tip));
  };

  setBearing(initialBearing);
  return { layer: group, setBearing };
}

export { fireSpreadBearing };
