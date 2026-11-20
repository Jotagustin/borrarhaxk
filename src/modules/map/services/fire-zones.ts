import L from "leaflet";
import type { Feature, Polygon } from "geojson";
import type { FireZoneCollection, FireZoneProperties } from "../types";
import { buildFireZonePopup } from "../lib/popup";
import { ANATOMY_STYLES, anatomyFromEstado } from "../lib/anatomy";
import type { TurfLike } from "./turf";
import { polygonAreaHectares } from "./turf";

/**
 * Crea la capa GeoJSON de zonas de incendio con:
 * - Estilos por anatomía (Frente Activo / Perímetro Contenido / Área Quemada).
 * - Marcador especial de "Punto de Origen".
 * - Popup detallado con hectáreas calculadas por Turf.js (si se provee).
 */
export function createFireZonesLayer(
  data: FireZoneCollection,
  onSelect?: (props: FireZoneProperties) => void,
  turf?: TurfLike,
): L.LayerGroup {
  const group = L.layerGroup();

  const geoLayer = L.geoJSON(data, {
    style: (feature) => {
      const props = feature?.properties as FireZoneProperties;
      const anatomia = anatomyFromEstado(props.estado);
      return { ...ANATOMY_STYLES[anatomia] };
    },
    onEachFeature: (feature: Feature<Polygon, FireZoneProperties>, layer) => {
      const props = feature.properties;
      if (!props) return;

      // Hectáreas calculadas matemáticamente (Turf.js) sobre la geometría real.
      const hectares = turf ? polygonAreaHectares(turf, feature) : undefined;

      layer.bindPopup(buildFireZonePopup(props, hectares), {
        maxWidth: 340,
        className: "fire-popup__container",
      });

      const anatomia = anatomyFromEstado(props.estado);

      layer.on({
        mouseover: (event) => {
          const target = event.target as L.Path;
          target.setStyle({ weight: (ANATOMY_STYLES[anatomia].weight ?? 2) + 1, fillOpacity: 0.6 });
          target.bringToFront();
        },
        mouseout: (event) => {
          const target = event.target as L.Path;
          target.setStyle({ ...ANATOMY_STYLES[anatomia] });
        },
        click: () => onSelect?.(props),
      });
    },
  });

  group.addLayer(geoLayer);

  // Marcador especial por cada "Punto de Origen".
  data.features.forEach((feature) => {
    const props = feature.properties;
    if (!props?.origen) return;

    const marker = L.marker(props.origen, {
      icon: L.divIcon({
        className: "origin-marker",
        html: `<div class="origin-marker__inner" title="Punto de origen">🔥</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      }),
    });

    marker.bindPopup(
      `<div class="tactic-popup">
        <h4>Punto de Origen</h4>
        <p><strong>Foco:</strong> ${props.nombre}</p>
        <p><strong>Inicio:</strong> ${new Date(props.inicio).toLocaleString("es-CL")}</p>
        <p class="tactic-popup__hint">Coordenadas: ${props.origen[0].toFixed(5)}, ${props.origen[1].toFixed(5)}</p>
      </div>`,
    );

    group.addLayer(marker);
  });

  return group;
}
