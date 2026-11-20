import type { LatLng, Rule303030Result, WeatherData } from "../types";

/**
 * Clima en tiempo real vía Open-Meteo (100% gratuito, sin API Key).
 * https://open-meteo.com
 */
const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

/** Forma cruda de la respuesta de Open-Meteo (solo lo que consumimos). */
interface OpenMeteoResponse {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
}

/**
 * Consulta el clima actual en unas coordenadas.
 * @param lat Latitud del foco.
 * @param lon Longitud del foco.
 * @param signal AbortSignal para cancelar la petición.
 */
export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m",
    timezone: "auto",
  });

  const res = await fetch(`${OPEN_METEO_BASE}?${params.toString()}`, { signal });
  if (!res.ok) {
    throw new Error(`Open-Meteo respondió ${res.status}`);
  }

  const data = (await res.json()) as OpenMeteoResponse;
  const current = data.current ?? {};

  return {
    temperature: current.temperature_2m ?? 0,
    humidity: current.relative_humidity_2m ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    windDirection: current.wind_direction_10m ?? 0,
    fetchedAt: current.time ?? new Date().toISOString(),
    timezone: data.timezone ?? "GMT",
  };
}

/** Evalúa la "Regla 30-30-30" (>30 °C, <30 % HR, >30 km/h). */
export function evaluateRule303030(w: WeatherData): Rule303030Result {
  const checks = {
    temperature: w.temperature > 30,
    humidity: w.humidity < 30,
    wind: w.windSpeed > 30,
  };
  return { active: checks.temperature && checks.humidity && checks.wind, checks };
}

/** Punto cardinal (en español) a partir de una dirección en grados. */
export function windCardinal(degrees: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return dirs[index];
}

/**
 * Dirección hacia donde AVANZA el fuego.
 *
 * La API entrega la dirección DESDE la que sopla el viento ("coming from"),
 * por lo que sumamos 180° para obtener hacia dónde va la propagación.
 */
export function fireSpreadBearing(windDirection: number): number {
  return (windDirection + 180) % 360;
}

/** Distancia (grados decimales) usada por el helper de destino. */
export type { LatLng };

/**
 * Calcula un punto destino dado un origen, un rumbo (°) y una distancia (m),
 * usando la fórmula esférica (suficiente para dibujar la flecha de viento).
 */
export function destinationPoint(origin: LatLng, bearingDeg: number, distanceM: number): LatLng {
  const R = 6_371_000; // radio terrestre en metros
  const δ = distanceM / R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (origin[0] * Math.PI) / 180;
  const λ1 = (origin[1] * Math.PI) / 180;

  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 =
    λ1 +
    Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

  return [(φ2 * 180) / Math.PI, (λ2 * 180) / Math.PI];
}
