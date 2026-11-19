"use client";

import dynamic from "next/dynamic";

/**
 * Wrapper cliente que carga el mapa solo en el navegador.
 *
 * Leaflet accede a `window`/`document` al importarse, por lo que no puede
 * ejecutarse durante el SSR/prerender de Next.js. `ssr: false` lo evita y,
 * además, mantiene el bundle de Leaflet fuera del render del servidor.
 */
const FireMap = dynamic(() => import("@/modules/map").then((mod) => mod.FireMap), {
  ssr: false,
  loading: () => (
    <div className="mapa-page__loading" role="status" aria-live="polite">
      Cargando mapa…
    </div>
  ),
});

export default function MapClient() {
  return <FireMap />;
}
