"use client";

import dynamic from "next/dynamic";

const FireMap = dynamic(() => import("@/modules/map").then((m) => m.FireMap), {
  ssr: false,
  loading: () => <div className="map-loading">Cargando mapa…</div>,
});

export default function DashboardMap() {
  return <FireMap />;
}
