/**
 * Cargador de recursos externos vía CDN.
 *
 * Se usa para Turf.js y Leaflet-Geoman (pedidos explícitamente vía CDN).
 * Cada recurso se inyecta una sola vez (idempotente) y se cachea en memoria.
 */

const loadedScripts = new Map<string, Promise<void>>();
const loadedStyles = new Set<string>();

/** Inyecta un <script> una única vez y resuelve cuando termina de cargar. */
export function loadScriptOnce(id: string, url: string): Promise<void> {
  const existing = loadedScripts.get(id);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const already = document.getElementById(id) as HTMLScriptElement | null;
    if (already) {
      // Ya está en el DOM: si aún no cargó, esperamos su evento onload.
      if (already.dataset.loaded === "true") {
        resolve();
        return;
      }
      already.addEventListener("load", () => resolve(), { once: true });
      already.addEventListener("error", () => reject(new Error(`No se pudo cargar ${url}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = url;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
    document.head.appendChild(script);
  });

  loadedScripts.set(id, promise);
  return promise;
}

/** Inyecta una hoja de estilos externa una única vez. */
export function loadStyleOnce(id: string, url: string): void {
  if (loadedStyles.has(id) || document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
  loadedStyles.add(id);
}
