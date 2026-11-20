import L from "leaflet";
import { loadScriptOnce, loadStyleOnce } from "../lib/cdn";
import { loadTurf, polygonAreaHectares } from "./turf";

/**
 * Función táctica 4: dibujo y medición en vivo con Leaflet-Geoman (CDN).
 * https://geoman.io — licencia MIT, gratuita y sin API Key.
 */

const GEOMAN_JS =
  "https://cdn.jsdelivr.net/npm/@geoman-io/leaflet-geoman-free@2.17.0/dist/leaflet-geoman.min.js";
const GEOMAN_CSS =
  "https://cdn.jsdelivr.net/npm/@geoman-io/leaflet-geoman-free@2.17.0/dist/leaflet-geoman.css";

/** Carga CSS + JS de Geoman y espera a que `L.PM` esté disponible. */
export async function loadGeoman(): Promise<void> {
  loadStyleOnce("geoman-cdn-css", GEOMAN_CSS);
  await loadScriptOnce("geoman-cdn-js", GEOMAN_JS);

  // Pequeña espera por si el script se registró como módulo UMD.
  await new Promise<void>((resolve) => {
    if ((L as unknown as { PM?: unknown }).PM) {
      resolve();
      return;
    }
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if ((L as unknown as { PM?: unknown }).PM || tries > 50) {
        window.clearInterval(timer);
        resolve();
      }
    }, 50);
  });
}

/**
 * Inicializa las herramientas de dibujo en el mapa:
 * - Dibujo de polígonos (perímetros de incendio) con cálculo automático de ha.
 * - Trazado de líneas (cortafuegos).
 * - Marcadores.
 * - Medición de distancias y áreas.
 * - Al terminar un polígono, muestra un popup con las hectáreas (Turf.js).
 */
export async function setupDrawingTools(map: L.Map): Promise<void> {
  await loadGeoman();
  const turf = await loadTurf();

  // Geoman se expone como `map.pm` una vez cargado (y como `L.PM` sus utilidades).
  const mapPm = map as unknown as {
    pm?: {
      addControls: (o: unknown) => void;
      setLang?: (lang: string) => void;
    };
  };

  if (!mapPm.pm) {
    console.warn("Leaflet-Geoman no está disponible; se omiten las herramientas de dibujo.");
    return;
  }

  // Controles de dibujo y medición (arriba a la izquierda).
  mapPm.pm.addControls({
    position: "topleft",
    drawMarker: true,
    drawCircleMarker: false,
    // La herramienta de línea muestra la distancia en vivo (medición).
    drawPolyline: true,
    drawRectangle: true,
    drawPolygon: true,
    drawCircle: false,
    drawText: false,
    cutPolygon: false,
    rotateMode: false,
    editMode: true,
    dragMode: true,
    removalMode: true,
  });

  // Traducción al español de la UI de Geoman, si está disponible.
  mapPm.pm.setLang?.("es");

  // Al CREAR una capa, la decoramos con popups informativos.
  map.on("pm:create", (event) => {
    const layer = (event as unknown as { layer: L.Layer }).layer;

    if (layer instanceof L.Polygon) {
      const latlngs = layer.getLatLngs();
      // Convierte a GeoJSON polygon [ [ [lng,lat], ... ] ] para Turf.
      const ring = (latlngs[0] as L.LatLng[]).map((ll) => [ll.lng, ll.lat]);
      // Cierra el anillo si hace falta.
      if (ring.length && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring.push(ring[0]);
      }
      const hectares = polygonAreaHectares(turf, {
        type: "Polygon",
        coordinates: [ring],
      });

      layer.bindPopup(
        `<div class="tactic-popup">
          <h4>Perímetro dibujado</h4>
          <p><strong>Área:</strong> ${hectares.toLocaleString("es-CL", {
            maximumFractionDigits: 2,
          })} ha</p>
          <p class="tactic-popup__hint">Calculado con Turf.js</p>
        </div>`,
      ).openPopup();

      layer.setStyle({ color: "#f97316", weight: 2, fillColor: "#f97316", fillOpacity: 0.25 });
    }

    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
      // El plugin de medición ya muestra la longitud; añadimos un popup resumen.
      const latlngs = layer.getLatLngs() as L.LatLng[];
      const meters = turf.length(
        { type: "LineString", coordinates: latlngs.map((ll) => [ll.lng, ll.lat]) },
        { units: "kilometers" },
      );
      layer.bindPopup(
        `<div class="tactic-popup">
          <h4>Cortafuegos / línea</h4>
          <p><strong>Longitud:</strong> ${
            meters >= 1
              ? `${meters.toLocaleString("es-CL", { maximumFractionDigits: 2 })} km`
              : `${Math.round(meters * 1000)} m`
          }</p>
        </div>`,
      );
    }
  });
}
