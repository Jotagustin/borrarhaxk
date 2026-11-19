# Proyecto Web Modular (Next.js)

Base estructural ordenada y escalable con separación clara entre **módulos de dominio**, **componentes reutilizables** y **servicios**.

## Estructura de carpetas

```text
.
├── docs/
│   └── architecture.md        # Reglas de arquitectura y dependencias
├── public/                    # Assets estáticos (fonts, icons, images)
├── src/
│   ├── app/                   # Next.js App Router (rutas, layouts, route groups)
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (dashboard)/       # Rutas privadas / aplicación principal
│   │   └── api/               # Route Handlers (BFF / proxies)
│   ├── components/            # Componentes compartidos sin lógica de negocio
│   │   ├── ui/                # Primitivas del sistema de diseño
│   │   ├── layout/            # Estructura visual global
│   │   └── feedback/          # Loaders, errores y estados vacíos
│   ├── modules/               # Módulos autocontenidos por dominio (vertical slices)
│   │   └── _template/         # Plantilla base (components, hooks, services, types)
│   ├── services/              # Capa transversal de infraestructura y APIs
│   │   ├── http/              # Cliente HTTP tipado y manejo de errores
│   │   ├── storage/           # Persistencia cliente (localStorage/cookies)
│   │   └── external/          # Integraciones con terceros
│   ├── hooks/                 # Custom hooks compartidos
│   ├── store/                 # Estado global de cliente
│   ├── lib/                   # Utilidades puras y helpers
│   ├── config/                # Variables de entorno y mapa de rutas
│   ├── styles/                # Estilos globales y tokens
│   └── types/                 # Contratos y tipos globales
├── tests/                     # Pruebas (unit, integration, e2e)
├── .env.example
├── next.config.ts
└── tsconfig.json
```

## Próximos pasos

1. Inicializar dependencias de Next.js si aún no existe `package.json`:
   ```bash
   npm init -y
   npm install next react react-dom
   npm install -D typescript @types/react @types/node
   ```
2. Copiar `.env.example` a `.env.local` y configurar `NEXT_PUBLIC_API_URL`.
3. Revisar [docs/architecture.md](docs/architecture.md) antes de agregar nuevos módulos o servicios.
