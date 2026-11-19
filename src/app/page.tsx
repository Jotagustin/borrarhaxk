import Link from "next/link";

const sections = [
  {
    href: "/mapa",
    title: "Mapa de Incendios",
    description: "Mapa interactivo con imágenes satelitales y zonas de incendio activas.",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Resumen general de tus finanzas y actividad reciente.",
  },
  {
    href: "/transactions",
    title: "Transacciones",
    description: "Lista, crea y edita movimientos de ingresos y gastos.",
  },
  {
    href: "/settings",
    title: "Ajustes",
    description: "Configura tu perfil, moneda y preferencias de la app.",
  },
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <h1>Finback</h1>
        <p>Gestiona tus finanzas personales de forma simple y clara.</p>
      </section>

      <section className="grid">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="card">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
