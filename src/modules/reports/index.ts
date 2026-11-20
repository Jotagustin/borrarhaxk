export type ReportClass = "relevant" | "review" | "spam";

export interface FireReport {
  id: string;
  title: string;
  location: string;
  submittedAt: string;
  source: "imagen" | "video";
  confidence: number;
  class: ReportClass;
  duration: string;
  mediaTone: string;
}

export interface AnalysisEvent {
  id: string;
  at: string;
  label: string;
  detail: string;
  status: "ok" | "warn" | "alert";
}

export const REPORT_CLASS_LABEL: Record<ReportClass, string> = {
  relevant: "Relevante",
  review: "En revisión",
  spam: "Posible spam",
};

export const fireReports: FireReport[] = [
  {
    id: "REP-4821",
    title: "Columna de humo en cerro norte",
    location: "Sector Quebrada Verde",
    submittedAt: "2026-11-19 08:42",
    source: "video",
    confidence: 0.94,
    class: "relevant",
    duration: "00:42",
    mediaTone: "tone-ember",
  },
  {
    id: "REP-4818",
    title: "Fuego en pastizal al borde de ruta",
    location: "Km 12, Ruta 5",
    submittedAt: "2026-11-19 08:15",
    source: "imagen",
    confidence: 0.88,
    class: "relevant",
    duration: "fotograma",
    mediaTone: "tone-ember",
  },
  {
    id: "REP-4811",
    title: "Posible fogata controlada",
    location: "Parque Municipal",
    submittedAt: "2026-11-19 07:58",
    source: "imagen",
    confidence: 0.61,
    class: "review",
    duration: "fotograma",
    mediaTone: "tone-haze",
  },
  {
    id: "REP-4804",
    title: "Resplandor nocturno sin humo",
    location: "Zona Industrial",
    submittedAt: "2026-11-19 07:31",
    source: "video",
    confidence: 0.57,
    class: "review",
    duration: "01:18",
    mediaTone: "tone-haze",
  },
  {
    id: "REP-4799",
    title: "Imagen duplicada de incendio previo",
    location: "No verificable",
    submittedAt: "2026-11-19 07:02",
    source: "imagen",
    confidence: 0.12,
    class: "spam",
    duration: "fotograma",
    mediaTone: "tone-mute",
  },
  {
    id: "REP-4790",
    title: "Adjunto corrupto / no concluyente",
    location: "No verificable",
    submittedAt: "2026-11-19 06:44",
    source: "imagen",
    confidence: 0.09,
    class: "spam",
    duration: "fotograma",
    mediaTone: "tone-mute",
  },
];

export const analysisEvents: AnalysisEvent[] = [
  {
    id: "EV-01",
    at: "00:02",
    label: "Carga de fotograma clave",
    detail: "Extracción a 12 fps del flujo de entrada",
    status: "ok",
  },
  {
    id: "EV-02",
    at: "00:05",
    label: "Detección de humo",
    detail: "Región superior derecha, densidad media",
    status: "warn",
  },
  {
    id: "EV-03",
    at: "00:09",
    label: "Detección de llama activa",
    detail: "Confianza 0.91 en el fotograma 108",
    status: "alert",
  },
  {
    id: "EV-04",
    at: "00:13",
    label: "Estimación de propagación",
    detail: "Vector de avance hacia el suroeste",
    status: "warn",
  },
  {
    id: "EV-05",
    at: "00:18",
    label: "Clasificación preliminar",
    detail: "Etiqueta: relevante",
    status: "ok",
  },
];

export const videoTimelinePoints: string[] = [
  "Fotograma 000 · sin anomalías",
  "Fotograma 024 · brillo elevado",
  "Fotograma 048 · humo incipiente",
  "Fotograma 072 · humo consolidado",
  "Fotograma 096 · llama detectada",
  "Fotograma 108 · pico térmico",
  "Fotograma 132 · propagación activa",
];

export const reportStats = {
  total: fireReports.length,
  relevant: fireReports.filter((r) => r.class === "relevant").length,
  review: fireReports.filter((r) => r.class === "review").length,
  spam: fireReports.filter((r) => r.class === "spam").length,
};

export type ReportCategory = ReportClass | "all";

export interface ReportCategoryMeta {
  slug: ReportCategory;
  title: string;
  description: string;
}

export const REPORT_CATEGORIES: ReportCategoryMeta[] = [
  {
    slug: "all",
    title: "Todos los reportes",
    description: "Evidencia recibida sin filtrar, imagen y video.",
  },
  {
    slug: "relevant",
    title: "Incendios relevantes",
    description: "Confianza alta, requiere despacho inmediato.",
  },
  {
    slug: "review",
    title: "Requieren revisión",
    description: "Señal ambigua o sin confirmar por un operador.",
  },
  {
    slug: "spam",
    title: "Posible spam",
    description: "Duplicados, adjuntos corruptos o no concluyentes.",
  },
];

export function getCategoryMeta(slug: string): ReportCategoryMeta | undefined {
  return REPORT_CATEGORIES.find((c) => c.slug === slug);
}

export function getReportsByCategory(slug: ReportCategory): FireReport[] {
  if (slug === "all") return fireReports;
  return fireReports.filter((r) => r.class === slug);
}
