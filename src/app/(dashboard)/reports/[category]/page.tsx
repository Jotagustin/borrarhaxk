import Link from "next/link";
import { notFound } from "next/navigation";
import {
  REPORT_CATEGORIES,
  REPORT_CLASS_LABEL,
  getCategoryMeta,
  getReportsByCategory,
  type ReportCategory,
} from "@/modules/reports";

export function generateStaticParams() {
  return REPORT_CATEGORIES.map((c) => ({ category: c.slug }));
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function ReportCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  const reports = getReportsByCategory(category as ReportCategory);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <Link href="/dashboard" className="back-link">
            <svg className="back-link__icon" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M10.5 3 5.5 8l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Volver a reportes
          </Link>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
      </section>

      {reports.length === 0 ? (
        <p className="muted">Sin reportes en esta categoría.</p>
      ) : (
        <section className="media-grid">
          {reports.map((r) => (
            <article key={r.id} className="media-card">
              <div className={`media-thumb ${r.mediaTone}`}>
                <span className="media-kind mono">{r.source === "video" ? "VIDEO" : "IMAGEN"}</span>
                <span className="media-duration mono">{r.duration}</span>
                {r.source === "video" && (
                  <span className="media-play" aria-hidden="true">
                    <span />
                  </span>
                )}
              </div>
              <div className="media-body">
                <span className="report-title">{r.title}</span>
                <span className="muted">
                  {r.location} · {r.submittedAt}
                </span>
                <div className="report-meta">
                  <span className="muted mono">{r.id}</span>
                  <span className="confidence">{Math.round(r.confidence * 100)}%</span>
                  <span className={`tag tag-${r.class}`}>{REPORT_CLASS_LABEL[r.class]}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
