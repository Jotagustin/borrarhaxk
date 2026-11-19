# Arquitectura del Proyecto

Esta estructura separa estrictamente **enrutamiento**, **módulos de dominio**, **componentes reutilizables** y **servicios transversales** para que el proyecto escale sin acoplamiento circular.

## Flujo de dependencias permitido

```text
src/app/         (Rutas, layouts y composición de pantallas)
   │
   ▼
src/modules/     (Features autocontenidas por dominio)
   │
   ├──► src/components/   (UI compartida, layout, feedback)
   ├──► src/services/     (Cliente HTTP, storage, SDKs externos)
   ├──► src/hooks/        (Hooks globales)
   └──► src/store/        (Estado global de cliente)
            │
            ▼
src/config/ · src/lib/ · src/types/   (Base sin dependencias de UI)
```

## Reglas clave

1. **`src/app/` delgado**: las páginas solo componen componentes/módulos y resuelven metadata o parámetros de ruta. No debe contener lógica de negocio ni `fetch` directo.
2. **Encapsulación en `src/modules/<dominio>/`**:
   - Cada módulo agrupa sus propios `components/`, `hooks/`, `services/` y `types/`.
   - Solo se importa desde su punto de entrada (`@/modules/<dominio>`), nunca desde archivos internos de otro módulo.
   - Evitar dependencias cruzadas entre módulos hermanos; si algo se comparte entre 2+ módulos, promoverlo a `src/components/`, `src/services/` o `src/lib/`.
3. **Desacoplamiento de servicios (`src/services/`)**:
   - Todo acceso HTTP pasa por `src/services/http/client.ts` para centralizar headers, base URL y manejo de `HttpError`.
   - Ningún componente UI debe llamar a `fetch` directamente; los componentes consumen hooks o servicios del módulo.
4. **Componentes compartidos (`src/components/`)**:
   - `ui/`: primitivas sin lógica de negocio (Button, Input, Modal, Card).
   - `layout/`: estructura de página (Navbar, Sidebar, Footer).
   - `feedback/`: estados transversales (EmptyState, ErrorFallback, Spinner).

## Cómo crear un nuevo módulo

1. Duplicar `src/modules/_template/` como `src/modules/<nombre>/`.
2. Definir tipos/DTOs en `types/`, llamadas HTTP en `services/`, hooks en `hooks/` y vistas en `components/`.
3. Exportar únicamente la API pública en `src/modules/<nombre>/index.ts`.
4. Conectar la pantalla correspondiente dentro de `src/app/`.
