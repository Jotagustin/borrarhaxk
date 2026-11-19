import type { Metadata } from "next";
import MapClient from "./MapClient";
import "./mapa.css";

export const metadata: Metadata = {
  title: "Mapa de Incendios | WebApp",
  description:
    "Mapa interactivo con imágenes satelitales de Esri World Imagery y zonas de incendio activas.",
};

export default function MapaPage() {
  return (
    <div className="mapa-page">
      <header className="mapa-page__header">
        <h1>Zonas de Incendio Activas</h1>
        <p>
          Imágenes satelitales de Esri World Imagery y relieve de OpenTopoMap.
          Usa el control superior derecho para alternar capas y etiquetas.
        </p>
      </header>

      <div className="mapa-page__map">
        <MapClient />
      </div>
    </div>
  );
}
