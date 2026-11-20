"use client";

import { useEffect, useRef, useState } from "react";
import {
  analysisEvents,
  videoTimelinePoints,
  type AnalysisEvent,
} from "@/modules/reports";

const STATUS_LABEL: Record<AnalysisEvent["status"], string> = {
  ok: "OK",
  warn: "Aviso",
  alert: "Alerta",
};

type Dot = { x: number; y: number };

interface MotionState {
  x: number;
  y: number;
  tx: number;
  ty: number;
  ease: number;
}

const DOT_COUNT = 18;

const initialDots: Dot[] = Array.from({ length: DOT_COUNT }, () => ({ x: 50, y: 50 }));

const dotSizes = Array.from({ length: DOT_COUNT }, () => 2 + Math.round(Math.random() * 2));

function randomPoint(): Dot {
  return { x: 6 + Math.random() * 88, y: 6 + Math.random() * 88 };
}

export default function AnalysisPage() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [dots, setDots] = useState<Dot[]>(initialDots);
  const motion = useRef<MotionState[]>([]);

  const total = videoTimelinePoints.length;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setRunning(false);
          return 100;
        }
        return Math.min(100, p + 4);
      });
    }, 180);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    motion.current = Array.from({ length: DOT_COUNT }, () => {
      const target = randomPoint();
      return {
        x: 50,
        y: 50,
        tx: target.x,
        ty: target.y,
        ease: 0.025 + Math.random() * 0.03,
      };
    });

    let raf = 0;
    const tick = () => {
      const next = motion.current.map((m) => {
        m.x += (m.tx - m.x) * m.ease;
        m.y += (m.ty - m.y) * m.ease;
        if (Math.abs(m.tx - m.x) < 0.6 && Math.abs(m.ty - m.y) < 0.6) {
          const target = randomPoint();
          m.tx = target.x;
          m.ty = target.y;
        }
        return { x: m.x, y: m.y };
      });
      setDots(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  useEffect(() => {
    const next = Math.min(total - 1, Math.floor((progress / 100) * total));
    setCursor(next);
  }, [progress, total]);

  const revealed = analysisEvents.filter(
    (_, i) => i <= Math.floor((progress / 100) * analysisEvents.length)
  );

  function reset() {
    setRunning(false);
    setProgress(0);
    setCursor(0);
    setDots(initialDots);
  }

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <h1>Análisis en vivo</h1>
          <p>Procesamiento fotograma a fotograma del video recibido.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setRunning(true)} disabled={running}>
            {progress >= 100 ? "Reiniciar" : running ? "Analizando" : "Iniciar análisis"}
          </button>
          <button className="btn btn-ghost" onClick={reset}>
            Limpiar
          </button>
        </div>
      </section>

      <section className="stage-wrap">
        <div className="stage">
          <div className="stage-grid" />
          {running && (
            <div className="stage-dots is-running">
              {dots.map((dot, i) => (
                <span
                  key={i}
                  className="dot"
                  style={{
                    left: `${dot.x}%`,
                    top: `${dot.y}%`,
                    width: `${dotSizes[i]}px`,
                    height: `${dotSizes[i]}px`,
                    animationDelay: `${(i % 6) * 0.35}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="stage-hud">
            <span className="mono">CAM-01</span>
            <span className="mono">12 fps</span>
            <span className="mono">{progress}%</span>
          </div>
          <div className="stage-center">
            {running || progress > 0 ? videoTimelinePoints[cursor] : "Sin flujo activo"}
          </div>
          <div className="stage-progress">
            <div className="stage-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <aside className="stage-side">
          <h2>Puntos analizados</h2>
          <ol className="timeline">
            {videoTimelinePoints.map((point, i) => (
              <li key={point} className={i <= cursor ? "is-on" : ""}>
                <span className="mono">{point}</span>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="events">
        <h2>Historial de análisis</h2>
        <ul className="report-list">
          {revealed.map((ev) => (
            <li key={ev.id} className="report-row">
              <div className="report-main">
                <span className="report-title">{ev.label}</span>
                <span className="muted">{ev.detail}</span>
              </div>
              <div className="report-meta">
                <span className="muted mono">{ev.at}</span>
                <span className={`tag tag-${ev.status}`}>{STATUS_LABEL[ev.status]}</span>
              </div>
            </li>
          ))}
          {revealed.length === 0 && (
            <li className="report-row muted">Sin eventos. Inicia el análisis.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
